function initialSetup(){
  // initialize tabs and accordion.
  // Saving last active element using localStorage
  $( "#tabs" ).tabs({
    activate: function (event, ui) {
         localStorage.setItem("active_tab", $( "#tabs" )
            .tabs("option", "active"));
     },
    active: parseInt(localStorage.getItem("active_tab")),
  });

  $( "#accordion" ).accordion({
    heightStyle: "content",
    change: function(event, ui) {
        localStorage.setItem('active_accordion', $( "#accordion" )
            .accordion("option", "active"));
        },
    active: parseInt(localStorage.getItem('active_accordion'))
    });
}

function viewReleases(){
  toLocalDate();
  // initial sorting by SubmittedAt (descending)
  // and then saving user table state using localStorage
  $( "#reviewed" ).dataTable({
    "bJQueryUI": true,
    "aaSorting": [[ 3, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( 'DataTables_reviewed'+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem('DataTables_reviewed'+window.location.pathname) );
    }
  });
  $( "#running" ).dataTable({
    "bJQueryUI": true,
    "aaSorting": [[ 2, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( 'DataTables_running'+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem('DataTables_running'+window.location.pathname) );
    }
  });
}

function toLocalDate() {
    $( '.submittedAt' ).each(function() {
        var localdate = new Date($(this).html());

        // formatDate does not handle hour/minute
        formateddate=$.datepicker.formatDate('yy/mm/dd', localdate) + " " + localdate.getHours() + ":" + (localdate.getMinutes() < 10?"0":"") + localdate.getMinutes();

        if ( $(this).prop('tagName') == 'TD' ) {
            $(this).empty().append(formateddate);
        } else {
            //this is not a table row: prepend 'Submitted at: '
            $(this).empty().append('Submitted at: ' + formateddate);
        }
    });
};

function escapeExpression(str) {
    return str.replace(/([#;&,_\-\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g, "\\$1");
}

function submittedReleaseButtons(buttonId) {
    var btnId = '#' + escapeExpression( buttonId );
    var other_btnId = btnId.replace("ready", "delete");
    if ( other_btnId == btnId ) {
        other_btnId = btnId.replace("delete", "ready");
    }
    if ( $( btnId ).is(':checked') ) {
        $( other_btnId ).attr('checked', false);
        $( other_btnId ).attr('disabled', true);
    }
    else {
        $( other_btnId ).attr('disabled', false);
    }
}

function disableSubmitButton(product) {
    // disables submit button
    // and makes the branch/revision red bold
    "use strict"
    $( '#submit_' + product ).prop('disabled', true);
}

function enableSubmitButton(product) {
    // enables submit button
    // and resets the input to the standard color
    "use strict"
    $( '#' + product + '-branch' ).removeClass('bold-red');
    $( '#' + product + '-mozillaRevision' ).removeClass('bold-red');
    $( '#submit_' + product ).prop('disabled', false);

}

function checkBranch(product) {
    // checks if the branch exists on the hg server
    "use strict"
    var branch = $( '#' + product + '-branch' ).val();
    if ( branch ) {
        // we have a branch!
        var url = 'https://hg.mozilla.org/' + branch;
        $.ajax({
            url: url,
            type: "GET",
            async: false, // blocking call
            success: function(data) {
                isValid(product, '-branch');
                // branch is ok, let's check the revision
                checkRevision(product);
                // There's no need to call checkErrors(product) here,
                // checkRevision() does it.
            },
            error: function(data) {
                // boo bad branch
                // mark it red & bold
                isNotValid(product, '-branch');
                checkErrors(product)
            },
        });
    }
}


function isValid(product, input) {
    "use strict"
    // removes special formatting from the input field
    $( '#' + product + input ).removeClass('bold-red');
}

function isNotValid(product, input) {
    "use strict"
    // disables the submit button and makes the input filed, red and bold
    $( '#' + product + input ).addClass('bold-red');
    disableSubmitButton(product);
}

function checkRevision(product) {
    // checks if  branch + revision exist on the hg server
    "use strict"
    var branch = $( '#' + product + '-branch' ).val();
    var revision = $( '#' + product + '-mozillaRevision' ).val();
    if (( branch ) && ( revision )) {
        // branch and revision are defined
        var url = 'https://hg.mozilla.org/' + branch + '/rev/' + revision;
        $.ajax({
            url: url,
            type: "GET",
            success: function(data) {
                isValid(product, '-branch');
                isValid(product, '-mozillaRevision');
                checkErrors(product);
            },
            error: function(data) {
                // no 'revision' in hg...
                isNotValid(product, '-mozillaRevision');
                checkErrors(product);
            },
        });
    } else {
    // branch/revision is not set
        if ( ! branch ) {
            isValid(product, '-branch');
        }
        if ( ! revision ) {
            isValid(product, '-mozillaRevision');
        }
    }
}

function checkErrors(product) {
    // if we have a wrong input element on the page, disable the submit button
    // if no errors, enable it
    "use strict"
    // select whatever has an id that starts with product and has
    // a bold red class e.g: <div id="firefox-branch" class="bold-red">...</div>
    var errors = $( '[id^=' + product + ']' ).find(".bold-red");
    if ( errors.length != 0 ) {
        // there are some errors on the page...
        disableSubmitButton( product );
    } else {
        // the page looks good
        enableSubmitButton( product );
    }
}

function validateForm(product, updated_input) {
    "use strict"
    switch ( updated_input ) {
        case 'branch':
            checkBranch(product);
            break;
        case 'revision':
            checkRevision(product);
            break;
        case 'default':
            // add other checks here
            break;
    }
}

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

function disableSubmitButton(product, reason) {
    // disables submit button
    // and makes the branch/revision red bold
    "use strict"
    $( '#submit_' + product ).prop('disabled', true);
    $( '#' + product + reason ).addClass('bold-red');
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
            success: function() {
                // branch is ok, let's check the revision
                checkRevision(product);
            },
            error: function() {
                // boo bad branch
                disableSubmitButton(product, '-branch');
            },

        });
    }
}

function checkRevision(product) {
    // checks if  branch + revision exist on the hg server
    "use strict"
    var branch = $( '#' + product + '-branch' ).val();
    var revision = $( '#' + product + '-mozillaRevision' ).val();
    var valid = true;
    if (( branch ) && ( revision )) {
        // branch and revision are defined
        var url = 'https://hg.mozilla.org/' + branch + '/rev/' + revision;
        $.ajax({
            url: url,
            type: "GET",
            success: function() {
                enableSubmitButton(product);
            },
            error: function() {
                disableSubmitButton(product, '-mozillaRevision');
            },
        });
    } else {
        // branch/revision is not set, flask will take care of this use case
        enableSubmitButton(product);
    }
}

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
    "aaSorting": [[ 2, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( 'DataTables_reviewed'+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem('DataTables_reviewed'+window.location.pathname) );
    }
  });
  $( "#complete" ).dataTable({
    "bJQueryUI": true,
    "aaSorting": [[ 2, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( 'DataTables_complete'+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem('DataTables_complete'+window.location.pathname) );
    }
  });
}

function toLocalDate() {
    $( '.submittedAt' ).each(function() {
        var localdate = new Date($(this).html());
        if ( $(this).prop('tagName') == 'TD' ) {
            $(this).empty().append(localdate.toLocaleString());
        } else {
            //this is not a table row: prepend 'Submitted at: '
            $(this).empty().append('Submitted at: ' + localdate.toLocaleString());
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

function validateReleaseUrl(release_url) {
    return true
}

function updateReleaseUrl(release_type) {
    var regex = /https:\/\/hg.mozilla.org\/(.*)\/rev\/(.*)/;
    var match = regex.exec( $( '#' + release_type + '-release-url' ).val() );
    if ( ! validateReleaseUrl ( $( '#' + release_type + '-release-url' ).val()) )  {
       // wrong url/url does not exist
       // make some noise
       return
    }
    else {
      // url is valid, update branch and revision
      if ( match ) {
        $( '#' + release_type + '-branch' ).val(match[1]);
        $( '#' + release_type + '-mozillaRevision' ).val(match[2]);
      };
    }
};

function updateBranchRevision(release_type) {
    var branch = $( '#' + release_type + '-branch' ).val().trim();
    var mozillaRevision = $( '#' + release_type + '-mozillaRevision' ).val().trim();
    if ( branch !== '' &&  mozillaRevision !== '' ) {
        $( '#' + release_type + '-release-url' ).val('https://hg.mozilla.org/' + branch + '/rev/' + mozillaRevision )
    };
};

function submitRelease(){
    var products = ["fennec", "firefox", "thunderbird"]
    products.forEach(function(product) {
      $( "#" + product + "\-release\-url" )
       .blur( function(){ updateReleaseUrl(product) });
      $( "#" + product + "\-mozillaRevision" )
       .blur( function(){updateBranchRevision(product) });
      $( "#" + product + "\-branch" )
       .blur( function() {updateBranchRevision(product) });
    });
}


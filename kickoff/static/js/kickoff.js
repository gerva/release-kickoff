function viewReleases(){
  toLocalDate();
  // initial sorting by SubmittedAt (descending)
  // and then saving user table state using localStorage
  $( "#reviewed" ).dataTable({
    "aaSorting": [[ 3, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( 'DataTables_reviewed'+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem('DataTables_reviewed'+window.location.pathname) );
    }
  });
  $( "#complete" ).dataTable({
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
        $( other_btnId ).attr('disabled', 'disabled');
    }
    else {
        $( other_btnId ).attr('disabled', false);
    }
}

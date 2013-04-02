function initialSetup(){
  $( "#tabs" ).tabs();
  $( "#accordion" ).accordion({ heightStyle: "content" });
}

function onTableChange(release_type) {
    // entry point for dataTable events
    toLocalDate(release_type);
}

function updateSubmitLocalDate() {
    $( '.submittedAt_submitted' ).each(function() {
        var localdate = new Date($(this).html());
        $(this).empty().append('Submitted at: ' + localdate.toLocaleString());
    });
};

function toLocalDate(release_type) {
    $( '.submittedAt_' + release_type ).each(function() {
        var localdate = new Date($(this).html());
            $(this).empty().append(localdate.toLocaleString());
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

function initialSetup(){
  $( "#tabs" ).tabs();
  $( "#accordion" ).accordion({ heightStyle: "content" });
}

function onTableChange(release_type){
    toLocalDate(release_type);
}

function toLocalDate(release_type) {
    $( '.submittedAt_' + release_type ).each(function() {
        var localdate = new Date($(this).html());
        if (release_type == 'submitted') {
            $(this).empty().append('Submitted at: ' + localdate.toLocaleString());
        }else{
            $(this).empty().append(localdate.toLocaleString());
        }
    });
};

function escapeExpression(str) {
    /* http://samuelsjoberg.com/archive/2009/09/escape-jquery-selectors */
    return str.replace(/([#;&,_\-\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g, "\\$1");
/*    return unescape(encodeURIComponent(str)) */
}

function submittedReleaseButtons(buttonId) {
    var btnId = '#' + escapeExpression( buttonId );
    var other_btnId = btnId.replace("ready", "delete");
    if ( other_btnId == btnId ) {
        other_btnId = btnId.replace("delete", "ready");
    }
    if ( $( btnId ).prop('checked') ) {
        $( other_btnId ).attr('checked', false);
        $( other_btnId ).attr('disabled', true);
    }
    else {
        $( other_btnId ).attr('disabled', false);
    }

}

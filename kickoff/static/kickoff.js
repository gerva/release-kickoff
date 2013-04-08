function initialSetup(){
  $( '#tabs' ).tabs();
  $( '#accordion' ).accordion({ heightStyle: 'content' });
  // adding blur functions
  $( '#fennec-release-url').blur(function() {
    updateReleaseUrl('fennec')
  });
  $( '#firefox-release-url').blur(function()
    {updateReleaseUrl('firefox')
  });
  $( '#thunderbird-release-url').blur(function() {
    updateReleaseUrl('thunderbird')
  });
}

function viewReleases(){
  toLocalDate();
  // initilaize dataTables sort by SubmittedAt descending
  $( '#reviewed' ).dataTable({
    'bJQueryUI': true,
    'aaSorting': [[ 2, 'desc' ]],
  });
  $( '#complete' ).dataTable({
    'bJQueryUI': true,
    'aaSorting': [[ 2, 'desc' ]],
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
    return str.replace(/([#;&,_\-\.\+\*\~':'\!\^$\[\]\(\)=>\|])/g, '\\$1');
}

function submittedReleaseButtons(buttonId) {
    var btnId = '#' + escapeExpression( buttonId );
    var other_btnId = btnId.replace('ready', 'delete');
    if ( other_btnId == btnId ) {
        other_btnId = btnId.replace('delete', 'ready');
    }
    if ( $( btnId ).is(':checked') ) {
        $( other_btnId ).attr('checked', false);
        $( other_btnId ).attr('disabled', true);
    }
    else {
        $( other_btnId ).attr('disabled', false);
    }
};

function updateReleaseUrl(release_type) {
    var regex = /https:\/\/hg.mozilla.org\/(.*)\/rev\/(.*)/;
    var match = regex.exec( $( '#' + release_type + '-release-url' ).val() );
    if ( match ) {
        $( '#' + release_type + '-branch' ).val(match[1]);
        $( '#' + release_type + '-mozillaRevision' ).val(match[2]);
    }
}

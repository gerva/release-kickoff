$(document).ready( function() {
    // initialize
    viewReleases();
    submitRelease();
    activateTooltips();
});

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

// update release branch/revision/release url
function submitRelease(){
    var products = ["fennec", "firefox", "thunderbird"]
    products.forEach(function(product) {
      $( "#" + product + "\-release\-url" )
       .blur( function(){ updateReleaseUrl(product) });
      $( "#" + product + "\-mozillaRevision" )
       .blur( function(){updateBranchRevision(product) });
      $( "#" + product + "\-branch" )
       .blur( function() {updateBranchRevision(product) });
      // preserve the state after a refresh
      if ( getLastBlurredItem(product) == 'url' ) {
        updateReleaseUrl(product);
        updateBranchRevision(product);
      } else {
        updateBranchRevision(product);
        updateReleaseUrl(product);
      }
    });
}

function setLastBlurredItem(release_type, name) {
    localStorage.setItem('last_blurred_item_' + release_type, name)
}

function getLastBlurredItem(release_type) {
    localStorage.getItem('last_blurred_item_' + release_type)
}

function updateReleaseUrl(release_type) {
  var regex = /https:\/\/hg.mozilla.org\/(.*)\/rev\/(.*)/;
  var release_url = $( '#' + release_type + '-release-url' ).val();
  var match = regex.exec(release_url);
  if ( match ) {
    $( '#' + release_type + '-branch' ).val(match[1]);
    $( '#' + release_type + '-mozillaRevision' ).val(match[2]);
    if ( verify_release_url(release_url) ) {
        release_url_is_valid(release_type)
    }
    setLastBlurredItem(release_type, 'url')
        release_url_is_not_valid(release_type)
  };
};

function release_url_is_valid(release_type) {
  $( '#' + release_type + '-release-url' ).css("color", "green")
}

function release_url_is_not_valid(release_type) {
  $( '#' + release_type + '-release-url' ).css("color", "red")
}

function verify_release_url(release_url) {
    $.getJSON($SCRIPT_ROOT + '/_verify_release_url', {
       release_url : release_url,
    }, function(data) {
        return data.exists
    })
}

function updateBranchRevision(release_type) {
    var branch = $( '#' + release_type + '-branch' ).val().trim();
    var mozillaRevision = $( '#' + release_type + '-mozillaRevision' ).val().trim();
    var release_url = 'https://hg.mozilla.org/' + branch + '/rev/' + mozillaRevision
    if ( branch !== '' &&  mozillaRevision !== '' ) {
        $( '#' + release_type + '-release-url' ).val(release_url)
        setLastBlurredItem(release_type, 'branchRelease')
    };
};

function activateTooltips() {
    $( '.help' ).tooltip({
      html: true,
      trigger: 'hover',
      delay: { show: 70, hide: 1000 },
    });
}



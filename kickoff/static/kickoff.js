//
BRANCH_TAG = "-branch"
REVISION_TAG = "-mozillaRevision"
RELBRANCH_TAG = "-mozillaRelbranch"
REVISION_URL_TAG = "-revision-url"
RELEASE_SEPARATOR = "rev"
RELEASE_HOST = "https://hg.mozilla.org"

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
        localStorage.setItem("active_accordion", $( "#accordion" )
            .accordion("option", "active"));
        },
    active: parseInt(localStorage.getItem("active_accordion"))
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
        localStorage.setItem( "DataTables_reviewed"+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem("DataTables_reviewed"+window.location.pathname) );
    }
  });
  $( "#complete" ).dataTable({
    "bJQueryUI": true,
    "aaSorting": [[ 2, "desc" ]],
    "bStateSave": true,
    "fnStateSave": function (oSettings, oData) {
        localStorage.setItem( "DataTables_complete"+window.location.pathname, JSON.stringify(oData) );
    },
    "fnStateLoad": function (oSettings) {
        return JSON.parse( localStorage.getItem("DataTables_complete"+window.location.pathname) );
    }
  });
}

function toLocalDate() {
    $( ".submittedAt" ).each(function() {
        var localdate = new Date($(this).html());
        if ( $(this).prop("tagName") == "TD" ) {
            $(this).empty().append(localdate.toLocaleString());
        } else {
            //this is not a table row: prepend "Submitted at: "
            $(this).empty().append("Submitted at: " + localdate.toLocaleString());
        }
    });
};

function escapeExpression(str) {
    return str.replace(/([#;&,_\-\.\+\*\~":"\!\^$\[\]\(\)=>\|])/g, "\\$1");
}

function submittedReleaseButtons(buttonId) {
    var btnId = "#" + escapeExpression( buttonId );
    var other_btnId = btnId.replace("ready", "delete");
    if ( other_btnId == btnId ) {
        other_btnId = btnId.replace("delete", "ready");
    }
    if ( $( btnId ).is(":checked") ) {
        $( other_btnId ).attr("checked", false);
        $( other_btnId ).attr("disabled", true);
    }
    else {
        $( other_btnId ).attr("disabled", false);
    }
}

// update release branch/revision/release url
function submit_form_manager(){
    var products = ["fennec", "firefox", "thunderbird"]
    products.forEach(function(product) {
      $( "#" + product + BRANCH_TAG )
       .blur( function(){ branchBlur(product) });
      $( "#" + product + REVISION_URL_TAG )
       .blur( function(){ revisionUrlBlur(product) });
      $( "#" + product + REVISION_URL_TAG )
       .blur( function(){ revisionBlur(product) });
      $( "#" + product + RELBRANCH_TAG)
       .blur( function(){ relBranchBlur(product) });
      // preserve the state after a refresh
      var lb = getLastBlurredItem(product)
      if ( lb == BRANCH_TAG ) { revisionUrlBlur(product) }
      if ( lb == REVISION_TAG ) { revisionBlur(product) }
      if ( lb == RELBRANCH_TAG ) { relBranchBlur(product) }
      if ( lb == REVISION_URL_TAG ) { revisionUrlBlur(product) }
    });
}

function revisionUrlBlur(product) {
  var url = getRevisionUrl(product)
  var branch = getBranchName(url)
  var revision = getResource(url)
  if ( isReleaseFromRevisionURL(url) ) {
    setBranch(product, branch)
    enableRevision(product)
    disableRelBranch(product)
    setRevision(product, revision)
    setReleaseBranch(product, "")
  } else {
    setBranch(product, branch)
    enableRelBranch(product)
    disableRevision(product)
    setReleaseBranch(product, revision)
    setRevision(product, "")
  }
  setLastBlurredItem(product, REVISION_URL_TAG)
}

function relBranchBlur(product) {
    var branch = getBranch(product)
    var relBranch = getReleaseBranch(product)
    disableRevision(product)
    if ( relBranch == "" ) {
      enableRevision(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, createRevisionURL(branch, relBranch ))
      }
    }
    setLastBlurredItem(product, REVISION_TAG)
}

function revisionBlur(product) {
    var branch = getBranch(product)
    var revision = getRevision(product)
    disableRelBranch(product)
    if ( revision == "" ) {
      enableRelBranch(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, createRevisionURL(branch, revision ))
      }
    }
    setLastBlurredItem(product, RELBRANCH_TAG)
}

function branchBlur(product) {
  var branch = getBranch(product)
  /* if both revision and relBranch are enabled
     they must be empty */
  var relBranch = getReleaseBranch(product)
  var revision = getRevision(product)
  if ( relBranch != "" || revision != "" ) {
    var release_url = createRevisionURL(branch, relBranch + revision )
    setRevisionUrl(product, release_url)
    setLastBlurredItem(product, BRANCH_TAG)
  }
}

function createRevisionURL(branch, resource) {
  // resource can be a revision or a releaseBranch
  url = [ RELEASE_HOST(), branch ]
  if ( isValidRevision(resource) ) {
    url.push( RELEASE_SEPARATOR )
  }
  url.push(resource)
  return url.join("/")
}

function isReleaseFromRevisionURL(urlstring) {
  var pattern = new RegExp("^.*/" + RELEASE_SEPARATOR + "/.*$")
  return pattern.exec(urlstring)
}

function isValidRevision(revisionId) {
  return revisionId.match(/^[0-9A-F]*$/i)
}

/* a bunch of gettes/setters to make code more readable */
function getBranchName(urlstring) {
  var parser = document.createElement('a');
  parser.href = urlstring
  var arr = parser.pathname.split("/")
  var pathname = arr.filter(function(val) {
                    return !(val === "" || val === RELEASE_SEPARATOR)
  });
  pathname.pop()
  return pathname.join("/")
}

function getResource(urlstring) {
  var parser = document.createElement('a');
  parser.href = urlstring
  return parser.pathname.split("/").pop()
}

function enableFormElement(element_id) {
  $( "#" + element_id + ":disabled" ).removeAttr("disabled")
}

function disableFormElement(element_id) {
  $( "#" + element_id + ":enabled" ).attr("disabled", "disabled")
}

function disableRelBranch(product) {
   disableFormElement( product + RELBRANCH_TAG )
}

function disableRevision(product) {
   disableFormElement( product + REVISION_TAG )
}

function enableRelBranch(product) {
  enableFormElement( product + RELBRANCH_TAG )
}

function enableRevision(product) {
  enableFormElement( product + REVISION_TAG )
}

function setFormInputElement(element_id, value) {
  $( "#" + element_id ).val( value )
}

function getFormInputElement(element_id) {
  return $( "#" + element_id ).val().trim()
}

function getRevision(product) {
  return getFormInputElement( product + REVISION_TAG )
}

function setRevision(product, value) {
  setFormInputElement( product + REVISION_TAG, value )
}

function getRevisionUrl(product) {
  return getFormInputElement( product + REVISION_URL_TAG )
}

function setRevisionUrl(product, value) {
  setFormInputElement( product + REVISION_URL_TAG , value )
}

function getReleaseBranch(product) {
  return getFormInputElement( product + RELBRANCH_TAG )
}

function setReleaseBranch(product, value) {
  setFormInputElement( product + RELBRANCH_TAG, value )
}

function getBranch(product) {
  return getFormInputElement( product + BRANCH_TAG )
}

function setBranch(product, value) {
  setFormInputElement( product + BRANCH_TAG, value )
}

function setLastBlurredItem(product, name) {
    localStorage.setItem("last_blurred_item_" + product, name)
}

function getLastBlurredItem(product) {
    localStorage.getItem("last_blurred_item_" + product)
}

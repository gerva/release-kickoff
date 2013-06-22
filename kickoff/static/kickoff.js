//
BRANCH_TAG = "-branch"
REVISION_TAG = "-mozillaRevision"
RELBRANCH_TAG = "-mozillaRelbranch"
REVISION_URL_TAG = "-revision-url"
COMM_RELBRANCH = "-commRelbranch"
COMM_REVISION = "-commRevision"
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
    "aaSorting": [[ 3, "desc" ]],
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
  } else {
    $( other_btnId ).attr("disabled", false);
  }
}

// update release branch/revision/release url
function submit_form_manager(){
  var products = ["fennec", "firefox", "thunderbird"]
  products.forEach(function(p){
      $( "#" + p + BRANCH_TAG)
        .keyup( function() { branchChange(p) })
      $( "#" + p + REVISION_TAG)
        .keyup( function() { revisionChange(p) })
      $( "#" + p + RELBRANCH_TAG)
        .keyup( function() { relBranchChange(p) })
      $( "#" + p + REVISION_URL_TAG)
        .keyup( function() { revisionUrlChange(p) })
      $( "#" + p + COMM_REVISION)
        .keyup( function() { commRevisionChange(p) })
      $( "#" + p + COMM_RELBRANCH)
        .keyup( function() { commRelbranchChange(p) })
    // preserve the state after a refresh
    if ( isEnabled( p + REVISION_TAG) ) {
      revisionChange(p)
    }
    if ( isEnabled(p + RELBRANCH_TAG) ) {
      relBranchChange(p)
    }
    if ( isEnabled(p + COMM_REVISION) ) {
      commRelbranchChange(p)
    }
    if ( isEnabled(p + COMM_RELBRANCH) ) {
      commRevisionChange(p)
    }
  });
}

function revisionUrlChange(product) {
  var url = getRevisionUrl(product)
  var resource = getResource(url)
  var revision_from_url = ""
  var relbranch_from_url = ""
  if ( isReleaseFromRevisionURL(url) ) {
    revision_from_url = resource
    enableRevision(product)
    disableRelBranch(product)
  } else {
    relbranch_from_url = resource
    enableRelBranch(product)
    disableRevision(product)
  }
  setBranch(product, getBranchName(url))
  setRevision(product, revision_from_url)
  setReleaseBranch(product, relbranch_from_url)
}

function relBranchChange(product) {
  var branch = getBranch(product)
  var relBranch = getReleaseBranch(product)
  disableRevision(product)
  if ( relBranch == "" ) {
    enableRevision(product)
  } else {
    if ( branch != "" ) {
      setRevisionUrl(product, createRevisionURL(product, branch, relBranch))
    }
  }
}

function revisionChange(product) {
  var branch = getBranch(product)
  var revision = getRevision(product)
  disableRelBranch(product)
  if ( revision == "" ) {
    enableRelBranch(product)
  } else {
    if ( branch != "" ) {
      setRevisionUrl(product, createRevisionURL(product, branch, revision))
    }
  }
}

function branchChange(product) {
  var branch = getBranch(product)
  /* if both revision and relBranch are enabled
     they must be empty */
  var relBranch = getReleaseBranch(product)
  var revision = getRevision(product)
  if ( relBranch != "" || revision != "" ) {
    var release_url = createRevisionURL(product, branch, relBranch + revision)
    setRevisionUrl(product, release_url)
  }
}
// thunderbird only
function commRelbranchChange(product) {
  if ( getCommRelbranch(product) != "" ) {
    disableCommRevision(product)
    setCommRevision(product, "")
  } else {
    enableCommRevision(product)
  }
}

function commRevisionChange(product) {
  if ( getCommRevision(product) != "" ) {
    disableCommRelbranch(product)
    setCommRelbranch(product, "")
  } else {
    enableCommRelbranch(product)
  }
}

function createRevisionURL(product, branch, resource) {
  // resource can be a revision or a releaseBranch
  var url = [ RELEASE_HOST, branch ]
  if ( isEnabled(product + REVISION_TAG) ) {
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

/* generic functions on element_id*/
function enableFormElement(element_id) {
  $( "#" + element_id + ":disabled" ).removeAttr("disabled")
}

function disableFormElement(element_id) {
  $( "#" + element_id + ":enabled" ).attr("disabled", "disabled")
}

function isEnabled(element_id) {
  return $( "#" + element_id ).is(":enabled")
}

function isDisabled(element_id) {
  return $( "#" + element_id).is(":disabled")
}

function getFormInputElement(element_id) {
  return $( "#" + element_id ).val().trim()
}

function setFormInputElement(element_id, value) {
  $( "#" + element_id ).val( value )
}

/* functions for release submit form */
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

function enableCommRevision(product) {
  enableFormElement( product + COMM_REVISION )
}

function disableCommRevision(product) {
  disableFormElement( product + COMM_REVISION )
}

function enableCommRelbranch(product) {
  enableFormElement( product + COMM_RELBRANCH )
}

function disableCommRelbranch(product) {
  disableFormElement( product + COMM_RELBRANCH )
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

function getCommRevision(product) {
  return getFormInputElement( product + COMM_REVISION )
}

function setCommRevision(product, value) {
  setFormInputElement( product + COMM_REVISION, value )
}

function getCommRelbranch(product) {
  return getFormInputElement( product + COMM_RELBRANCH )
}

function setCommRelbranch(product, value) {
  setFormInputElement( product + COMM_RELBRANCH, value )
}


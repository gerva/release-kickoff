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
      $( "#" + product + "\-branch" )
       .blur( function(){ branchBlur(product) });
      $( "#" + product + "\-revision\-url" )
       .blur( function(){ revisionUrlBlur(product) });
      $( "#" + product + "\-mozillaRevision" )
       .blur( function(){ revisionBlur(product) });
      $( "#" + product + "\-mozillaRelbranch")
       .blur( function(){ relBranchBlur(product) });
      // preserve the state after a refresh
      var lb = getLastBlurredItem(product)
      if ( lb == "branch" ) { revisionUrlBlur(product) }
      if ( lb == "revision-url" ) { revisionUrlBlur(product) }
      if ( lb == "mozillaRevision" ) { revisionBlur(product) }
      if ( lb == "mozillaRelbranch" ) { relBranchBlur(product) }
    });
}

function revisionUrlBlur(product) {
  var url = getRevisionUrl(product)
  var branch = getBranchName(url)
  var revision = getResource(url)
  if ( isValidRevision(revision) ) {
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
  setLastBlurredItem(product, "revision-url")
}

function relBranchBlur(product) {
    var branch = getBranch(product)
    var relBranch = getReleaseBranch(product)
    disableRevision(product)
    if ( relBranch == "" ) {
      enableRevision(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, createRevisionURL(branch, relBranch))
      }
    }
    setLastBlurredItem(product, "mozillaRevision")
}

function revisionBlur(product) {
    var branch = getBranch(product)
    var revision = getRevision(product)
    disableRelBranch(product)
    if ( revision == "" ) {
      enableRelBranch(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, createRevisionURL(branch, revision))
      }
    }
    setLastBlurredItem(product, "mozillaRelbranch")
}

function branchBlur(product) {
  var branch = getBranch(product)
  /* if both revision and relBranch are enabled
     they must be empty */
  var relBranch = getReleaseBranch(product)
  var revision = getRevision(product)
  if ( relBranch != "" || revision != "" ) {
    var release_url = createRevisionURL(branch, relBranch + revision)
    setRevisionUrl(product, release_url)
    setLastBlurredItem(product, "branch")
  }
}

function createRevisionURL(branch, resource) {
  // resource can be a revision or a releaseBranch
  return releaseHost() + branch + releaseSeparator() + resource
}
function isValidRevision(revisionId) {
  return /[a-fA-F][0-9]{12}/.exec(revisionId)
}

function releaseHost() {
  // moving all the references to hg.mozilla.org
  // here so it should be easier to refactor
  return "https://hg.mozilla.org/"
}

function releaseSeparator() {
  // this value must be removed
  return "/rev/"
}

/* a bunch of gettes/setters to make code more readable */
function getBranchName(urlstring) {
  var parser = document.createElement('a');
  parser.href = urlstring
  var pathname = parser.pathname
  pathname = pathname.replace("^/*", "")
  return pathname.split( releaseSeparator() )[0]
}

function getResource(urlstring) {
  var parser = document.createElement('a');
  parser.href = urlstring
  return parser.pathname.split( releaseSeparator() )[1]
}

function enableFormElement(element_id) {
  $( "#" + element_id + ":disabled" ).removeAttr("disabled")
}

function disableFormElement(element_id) {
  $( "#" + element_id + ":enabled" ).attr("disabled", "disabled")
}

function disableRelBranch(product) {
   disableFormElement( product + "-mozillaRelbranch" )
}

function disableRevision(product) {
   disableFormElement( product + "-mozillaRevision" )
}

function enableRelBranch(product) {
  enableFormElement( product + "-mozillaRelbranch" )
}

function enableRevision(product) {
  enableFormElement( product + "-mozillaRevision" )
}

function setFormInputElement(element_id, value) {
  $( "#" + element_id ).val( value )
}

function getFormInputElement(element_id) {
  return $( "#" + element_id ).val().trim()
}

function getRevision(product) {
  return getFormInputElement( product + "-mozillaRevision" )
}

function setRevision(product, value) {
  setFormInputElement( product + "-mozillaRevision", value )
}

function getRevisionUrl(product) {
  return getFormInputElement( product + "-revision-url" )
}

function setRevisionUrl(product, value) {
  setFormInputElement( product + "-revision-url" , value )
}

function getReleaseBranch(product) {
  return getFormInputElement( product + "-mozillaRelbranch" )
}

function setReleaseBranch(product, value) {
  setFormInputElement( product + "-mozillaRelbranch", value )
}

function getBranch(product) {
  return getFormInputElement( product + "-branch" )
}

function setBranch(product, value) {
  setFormInputElement( product + "-branch", value )
}

function setLastBlurredItem(product, name) {
    localStorage.setItem("last_blurred_item_" + product, name)
}

function getLastBlurredItem(product) {
    localStorage.getItem("last_blurred_item_" + product)
}


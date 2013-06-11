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
      if ( lb == "mozillaReleaseBranch" ) { revisionUrlBlur(product) }
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
    var url = "https//hg.mozilla.org/" + branch + "/rev/" + relBranch
    disableRevision(product)
    if ( relBranch == "" ) {
      enableRevision(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, url)
      }
    }
    setLastBlurredItem(product, "mozillaRevision")
}

function revisionBlur(product) {
    var branch = getBranch(product)
    var revision = getRevision(product)
    var url = "https//hg.mozilla.org/" + branch + "/rev/" + revision
    disableRelBranch(product)
    if ( revision == "" ) {
      enableRelBranch(product)
    } else {
      if ( branch != "" ) {
        setRevisionUrl(product, url)
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
      var release_url = "https://hg.mozilla.org/" + branch + "/rev/" + relBranch + revision
      setRevisionUrl(product, release_url)
      setLastBlurredItem(product, "mozillaReleaseBranch")
    }
}



/* a bunch of gettes/setters to make code more readable */
function isValidRevision(revisionId) {
  return /[a-fA-F][0-9]{12}/.exec(revisionId)
}

function getResource(urlstring) {
  var regex = "^.*/rev/\(.*\)$"
  if ( match ) {
    return match[0]
  }
  return ""
}

function getBranchName(urlstring) {
  var regex = "^.*/\(.*\)/rev/.*$"
  var match = regex.exec(urlstring)
  if ( match ) {
    return match[0]
  }
  return ""
}

function enableFormElement(element_id) {
  $( "#" + element_id + ":disabled" ).removeAttr("disabled")
}

function disableFormElement(element_id) {
  $( "#" + element_id + ":enabled" ).attr("disabled", "disabled")
}

function disableRelBranch(release_type) {
   disableFormElement( release_type + "-mozillaRelbranch" )
}

function disableRevision(release_type) {
   disableFormElement( release_type + "-mozillaRevision" )
}

function enableRelBranch(release_type) {
  enableFormElement( release_type + "-mozillaRelbranch" )
}

function enableRevision(release_type) {
  enableFormElement( release_type + "-mozillaRevision" )
}

function setFormInputElement(element_id, value) {
  $( "#" + element_id ).val( value )
}

function getFormInputElement(element_id) {
  return $( "#" + element_id ).val().trim()
}

function getRevision(release_type) {
  return getFormInputElement( release_type + "-mozillaRevision" )
}

function setRevision(release_type, value) {
  setFormInputElement( release_type + "-mozillaRevision", value )
}

function getRevisionUrl(release_type) {
  return getFormInputElement( release_type + "-revision-url" )
}

function setRevisionUrl(release_type, value) {
  setFormInputElement( release_type + "-revision-url" , value )
}

function getReleaseBranch(release_type) {
  return getFormInputElement( release_type + "-mozillaRelbranch" )
}

function setReleaseBranch(release_type, value) {
  setFormInputElement( release_type + "-mozillaRelbranch", value )
}

function getBranch(release_type) {
  return getFormInputElement( release_type + "-branch" )
}

function setBranch(release_type, value) {
  setFormInputElement( release_type + "-branch", value )
}

function setLastBlurredItem(release_type, name) {
    localStorage.setItem("last_blurred_item_" + release_type, name)
}

function getLastBlurredItem(release_type) {
    localStorage.getItem("last_blurred_item_" + release_type)
}


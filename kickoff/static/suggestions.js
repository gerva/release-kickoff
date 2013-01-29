function addVersionSuggestions(versionElement, versionSuggestions, buildNumberElement, buildNumberSuggestions) {
    // We need to fire this for two different events
    // so it must be defined up here.
    function populateBuildNumber(version) {
        // If we have a build number for the version we're given, use it!
        if (buildNumberSuggestions.hasOwnProperty(version)) {
            buildNumberElement.val(buildNumberSuggestions[version]);
        }
        // If not, reset to nothing to help avoid accidentally using a bad value
        else {
            buildNumberElement.val('1');
        }
    }
    versionElement.autocomplete({
        source: versionSuggestions,
        minLength: 0,
        delay: 0,
        // Put the autocomplete drop down to the right of the field, unless
        // that would cause horizontal scrolling.
        position: {
            my: 'left',
            at: 'right',
            of: versionElement,
            collision: 'flip',
        },
        select: function(event, ui) {
            populateBuildNumber(ui.item.value);
        }
    }).focus(function() {
        $(this).autocomplete('search');
    }).change(function() {
        populateBuildNumber(this.value);
    });
}

function addBranchSuggestions(branchElement, suggestions) {
    branchElement.autocomplete({
        source: suggestions,
        minLength: 0,
        delay: 0,
        position: {
            my: 'left',
            at: 'right',
            of: branchElement,
            collision: 'flip',
        },
    }).focus(function() {
        $(this).autocomplete('search');
    });
}

function addPartialsSuggestions(partialsElement, suggestions) {
}

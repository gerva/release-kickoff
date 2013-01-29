function addVersionSuggestions(versionElement, buildNumberElement, suggestions) {
    // We need to fire this for two different events
    // so it must be defined up here.
    function populateBuildNumber(version) {
        // If we have a build number for the version we're given, use it!
        if (suggestions.hasOwnProperty(version)) {
            buildNumberElement.val(suggestions[version]);
        }
        // If not, reset to nothing to help avoid accidentally using a bad value
        else {
            buildNumberElement.val('');
        }
    }
    versionElement.autocomplete({
        source: Object.keys(suggestions),
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
}

function addPartialsSuggestions(partialsElement, suggestions) {
}

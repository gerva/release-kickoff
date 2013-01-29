function addVersionSuggestions(versionElement, versionSuggestions, buildNumberElement, buildNumberSuggestions) {
    versionSuggestions.sort(function(a, b) {
        return a > b;
    });
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

function addBranchSuggestions(branchElement, branchSuggestions, partialsElement, partialsSuggestions) {
    branchSuggestions.sort(function(a, b) {
        return a > b;
    });
    branchElement.autocomplete({
        source: branchSuggestions,
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
    if (partialsElement != null) {
        function populatePartials(branch) {
            partialsElement.autocomplete({
                source: function(request, response) {
                    var suggest = partialsSuggestions[branch];
                    suggest.sort(function(a, b) {
                        return a > b;
                    });
                    response($.ui.autocomplete.filter(
                        suggest, extractLast(request.term)
                    ));
                },
                minLength: 0,
                delay: 0,
                position: {
                    my: 'left',
                    at: 'right',
                    of: partialsElement,
                    collision: 'flip',
                },
                select: function(event, ui) {
                    var terms = split(this.value);
                    terms.pop();
                    terms.push(ui.item.value);
                    this.value = terms.join(", ");
                    return false;
                }
            }).focus(function() {
                $(this).autocomplete('search');
                // prevent value inserted on focus
                return false;
            });
        }
        branchElement.on('autocompleteselect', function(event, ui) {
            populatePartials(ui.item.value);
        });
        branchElement.on('autocompletechange', function() {
            populatePartials(this.value);
        });
    }
}

function split(val) {
    return val.split(/,\s*/);
}

function extractLast(term) {
    return split(term).pop();
}

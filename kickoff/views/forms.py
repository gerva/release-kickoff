import simplejson as json

from flask.ext.wtf import SelectMultipleField, ListWidget, CheckboxInput, Form, \
  BooleanField, StringField, Length, TextAreaField, DataRequired, IntegerField, \
  HiddenField, Regexp

from mozilla.build.versions import ANY_VERSION_REGEX

from kickoff.model import Release

# From http://wtforms.simplecodes.com/docs/1.0.2/specific_problems.html#specialty-field-tricks
class MultiCheckboxField(SelectMultipleField):
    """A multiple-select, except displays a list of checkboxes. Iterating the
       field will produce subfields, allowing custom rendering of the enclosed
       checkbox fields."""
    widget = ListWidget(prefix_label=False)
    option_widget = CheckboxInput()

class ReadyForm(Form):
    readyReleases = MultiCheckboxField('readyReleases')

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

class CompleteForm(Form):
    complete = BooleanField('complete')
    # Use the Column length directly rather than duplicating its value.
    status = StringField('status', [Length(max=Release.status.type.length)])

PARTIAL_VERSIONS_REGEX = ('^(%sbuild\d+)(,%sbuild\d)*$' % (ANY_VERSION_REGEX, ANY_VERSION_REGEX))

class JSONField(TextAreaField):
    def process_formdata(self, valuelist):
        if valuelist and valuelist[0]:
            self.data = valuelist[0]
            try:
                # We only care about whether the JSON validates or not, so
                # we don't save this anywhere. Consumers of the form want the
                # raw string version, not the parsed object.
                json.loads(self.data)
            except ValueError, e:
                self.process_errors.append(e.args[0])
        else:
            self.data = None

class ReleaseForm(Form):
    version = StringField('Version:', validators=[Regexp(ANY_VERSION_REGEX, message='Invalid version format.')])
    buildNumber = IntegerField('Build Number:', validators=[DataRequired('Build number is required.')])
    branch = StringField('Branch:', validators=[DataRequired('Branch is required')])
    mozillaRevision = StringField('Mozilla Revision:', validators=[DataRequired('Mozilla revision is required.')])
    dashboardCheck = BooleanField('Dashboard check?', default=True)

class FennecReleaseForm(ReleaseForm):
    product = HiddenField('product')
    l10nChangesets = JSONField('L10n Changesets:', validators=[DataRequired('L10n Changesets are required.')])

    def __init__(self, *args, **kwargs):
        ReleaseForm.__init__(self, prefix='fennec', product='fennec', *args, **kwargs)

class DesktopReleaseForm(ReleaseForm):
    partials = StringField('Partial versions:',
        validators=[Regexp(PARTIAL_VERSIONS_REGEX, message='Invalid partials format.')]
    )
    l10nChangesets = TextAreaField('L10n Changesets:', validators=[DataRequired('L10n Changesets are required.')])

class FirefoxReleaseForm(DesktopReleaseForm):
    product = HiddenField('product')

    def __init__(self, *args, **kwargs):
        ReleaseForm.__init__(self, prefix='firefox', product='firefox', *args, **kwargs)

class ThunderbirdReleaseForm(DesktopReleaseForm):
    product = HiddenField('product')
    commRevision = StringField('Comm Revision:', validators=[DataRequired('Comm revision is required.')])

    def __init__(self, *args, **kwargs):
        ReleaseForm.__init__(self, prefix='thunderbird', product='thunderbird', *args, **kwargs)

def getReleaseForm(release):
    """Helper method to figure out which form is needed for a release, based
       on its name."""
    release = release.lower()
    if release.startswith('fennec'):
        return FennecReleaseForm
    elif release.startswith('firefox'):
        return FirefoxReleaseForm
    elif release.startswith('thunderbird'):
        return ThunderbirdReleaseForm
    else:
        raise ValueError("Can't find release table for release %s" % release)

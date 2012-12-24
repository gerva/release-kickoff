from flask import request

from cef import log_cef

import kickoff

import logging
logger = logging.getLogger(__name__)

# Standard CEF levels at Mozilla. More details here:
# https://mana.mozilla.org/wiki/display/SECURITY/CEF+Guidelines+for+Application+Development+at+Mozilla#CEFGuidelinesforApplicationDevelopmentatMozilla-apxaAppendixA-%C2%A0Severity%C2%A0IntegersSuggestions
CEF_INFO = 4
CEF_WARN = 6
CEF_ALERT = 8
CEF_EMERG = 10

def event(name, severity, **custom_exts):
    # Extra values need to be in the format csNLabel=xxx, csN=yyy
    extra_exts = {}
    n = 1
    for k, v in custom_exts:
        valueKey = 'cs%d' % n
        labelKey = '%sLabel' % valueKey
        extra_exts[labelKey] = k
        extra_exts[valueKey] = v
        n += 1

    username = request.environ.get('REMOTE_USER', 'Unknown User')
    log_cef(name, severity, request.environ, kickoff.app.config, username=username, **extra_exts)

def config():
    return {
        'cef_version': kickoff.version,
        'cef_product': 'Release Kickoff',
    }

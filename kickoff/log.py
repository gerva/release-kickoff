import time

from flask import request

import kickoff

import logging
logger = logging.getLogger(__name__)

# https://mana.mozilla.org/wiki/display/SECURITY/CEF+Guidelines+for+Application+Development+at+Mozilla#CEFGuidelinesforApplicationDevelopmentatMozilla-apxaAppendixA-%C2%A0Severity%C2%A0IntegersSuggestions
CEF_SEVERITIES = {
    'Info':  (4, logging.INFO),
    'Warn':  (6, logging.WARNING),
    'Alert': (8, logging.WARNING),
    'Emerg': (10, logging.WARNING),
}

def cef_event(name, severity, extra_exts={}, *args, **kwargs):
    """Logs a CEF event, prepending it with the static parts of the message.
       More details at https://mana.mozilla.org/wiki/display/SECURITY/CEF+Guidelines+for+Application+Development+at+Mozilla"""
    # According to the CEF docs, the signature can just be a shortened version
    # of the event name.
    signature = name.replace(' ', '')
    severity, level = CEF_SEVERITIES.get(severity, ('Unknown', logging.WARNING))
    all_exts = {
        'src': request.remote_addr,
        'request': request.url,
        'requestContext': request.environ.get('HTTP_USER_AGENT', 'Unknown User Agent'),
        'suser': request.environ.get('REMOTE_USER', 'Unknown User'),
        'end': str(time.time()),
    }
    all_exts.update(extra_exts)
    exts = " ".join(['='.join(ext) for ext in all_exts.iteritems()])
    msg = 'CEF:0|Mozilla|Ship it|%s|%s|%s|%d|%s' % (kickoff.version, signature, name, severity, exts)
    return logger.log(level, msg, *args, **kwargs)

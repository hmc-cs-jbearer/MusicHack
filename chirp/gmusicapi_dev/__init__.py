# -*- coding: utf-8 -*-

from gmusicapi_dev._version import __version__
from gmusicapi_dev.clients import Webclient, Musicmanager, Mobileclient
from gmusicapi_dev.exceptions import CallFailure
import logging

__copyright__ = 'Copyright 2015 Simon Weber'
__license__ = 'BSD 3-Clause'
__title__ = 'gmusicapi_dev'

# appease flake8: the imports are purposeful
(__version__, Webclient, Musicmanager, Mobileclient, CallFailure)

logging.basicConfig() 
logging.getLogger().setLevel(logging.NOTSET)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.NOTSET)
requests_log.propagate = True
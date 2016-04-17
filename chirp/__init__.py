from flask import Flask

app = Flask(__name__)
app.debug = True

log_file = open('log.txt', 'a')

import chirp.views
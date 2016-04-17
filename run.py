from chirp import app
from chirp import log_file
import os

if __name__ == '__main__':
	try:
		app.run(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 8080)))
	except KeyboardInterrupt:
		log_file.close()
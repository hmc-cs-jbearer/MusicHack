var express = require("express");
var https = require("https");
var fs = require('fs');
var bodyParser = require("body-parser");
var Firebase = require("firebase");

var templates = require("nunjucks");
templates.configure("templates");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static"));

const DATABASE_URL = "https://musichack16.firebaseio.com/";

// Read the Firebase secret from a file and pass it to the callback
function getFirebaseSecret(callback) {
	fs.readFile('env.txt', 'utf8', callback);
}

// Get data from firebase. Callback is called on completion, and takes 1
// argument, namely the JSON object received.
function getData(path, callback) {
	getFirebaseSecret(function(error, secret) {
		if (error) {
			console.log(error);
		}
		else {
			https.get(DATABASE_URL + path + ".json?auth=" + secret, (response) => {

				// Read incoming data from the request
				var data = "";
				response.on("data", (chunk) => {
					data += chunk;
				});

				// Send the data to the callback function
				response.on("end", () => {
					return callback(JSON.parse(data));
				});

			}).on("error", (err) => {
				console.log(err);
			});
		}
	});
}

/**
 * \brief This endpoint uses post internally, so a GET request to '/' means that
 *	the user has just navigated to the page. Check to see if they have a saved
 *	session. If so, direct them to their homepage. Otherwise, log them in.
 */
app.get("/", function(req, res) {
		res.send(templates.render("saved-session.njk"));
});

/**
 * \brief Display the users homepage.
 */
app.post("/", function(req, res) {
	var firebase = new Firebase(DATABASE_URL);

	// Get user data so we can personalize their home page
	firebase.authWithCustomToken(req.body.token, function(error, authData) {
		if (error) {
			res.redirect("/login?continue=/&error=Login+error:+" + error);
		}
		else {
			getData("users/" + authData.uid + "/networks", function(networks) {

				// Set the current context to the first network in the user's networks
				nid = Object.keys(networks)[0];

				res.send(templates.render("user.njk", {
					// An object containing information about the user's networks
					networks: networks,

					// The ID of the current network context to display on the user's page
					nid: nid

				}));
			});
		}
	});
});

/**
 * \brief Log in the user.
 * \param [query] continue URL to which the user should be redirected upon
 *	successful login.
 * \param [query] error An error message to display, if any.
 */
app.get("/login", function(req, res) {
	res.send(templates.render("login.njk", {
		continue: req.query.continue,
		error: req.query.error
	} ));
});


/// \todo
app.get("/get-current-song", function(req, res) {

});

app.listen(8080);

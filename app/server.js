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
 * \brief Display the users homepage.
 */
app.get("/", function(req, res) {

	if (!req.query.hasOwnProperty("token")) {
		res.redirect("/login?continue=/");
		return;
	}

	var firebase = new Firebase(DATABASE_URL);
	firebase.authWithCustomToken(req.query.token, function(error, authData) {
		if (error) {
			res.redirect("/login?continue=/&error=Login+error:+" + error);
		}
		else {
			getData("users/" + authData.uid + "/networks", function(networks) {

				// Set the current context to the first network in the user's networks
				nid = Object.keys(networks)[0];

				console.log(nid);
				console.log(networks);

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


app.get("/new-network", function(req,res) {
	res.send(templates.render("new-network.njk"));
});

app.post("/add-network", function(req, res) {
	token = req.body.token;
	network_name = req.body.name;

	var firebase = new Firebase(DATABASE_URL);
	firebase.authWithCustomToken(token, function(error, authData) {
		if (error) {
			console.log("Authentication failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", authData);
		}

		console.log(authData);

		//firebase.put("/networks", network_name, {
		//	"admin": authData.uid
		//});

	}); //end authWithCustomToken

	res.send(templates.render("user.njk"));
}); //end add-network



/// \todo
app.get("/get-current-song", function(req, res) {

});

app.listen(8080);

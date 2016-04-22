var express = require("express");
var bodyParser = require("body-parser");
var Firebase = require("firebase");

var templates = require("nunjucks");
templates.configure("templates");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static"));

var DATABASE_URL = "https://musichack16.firebaseio.com/";

/**
 * \brief Display the users homepage.
 */
app.get("/", function(req, res) {
	res.send(templates.render("user.njk"));
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

app.listen(8080);

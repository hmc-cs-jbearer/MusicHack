var app = new Router("templates");

app.route("/login", function(args) {
	app.render("login.njk", {continue:args.continue, error:args.error});
});

app.handleRequest();
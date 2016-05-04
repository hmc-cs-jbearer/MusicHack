var app = new Router();

app.route("/public/login", function(args) {
  app.render("login.njk", args);
});

app.route("/public/register", function(args) {
  app.render("register.njk", args);
});

app.handleRequest();
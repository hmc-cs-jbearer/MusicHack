var app = new Router();

app.route("/public/login", function(args) {
  app.render("login.njk", args);
});

app.route("/public/register", function(args) {
  app.render("register.njk", args);
});

app.route("/public/reset-password", function(args) {
  app.render("forgot-password.njk", args);
});

app.route("/public/password-reset-success", function(args) {
  app.render("password-reset-success.njk", args);
});

app.handleRequest();
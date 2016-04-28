/**
 * Routing and template rendering. This is not a substitute for server-side
 * logic. This framework should only be used to render templates for various
 * URLs. As much logic as possible should be done by the page as needed, since
 * everything that happens here will slow down the page load.
 */

var app = new Router();

nunjucks.configure("templates");
function render(template, context) {
  document.write(nunjucks.render(template, context));
}

app.route("/", function(args) {
  render("login.njk", {continue:"/"});
});

// Route the request to the proper handlers
app.handleRequest();

/**
 * Routing and template rendering. This is not a substitute for server-side
 * logic. This framework should only be used to render templates for various
 * URLs. As much logic as possible should be done by the page as needed, since
 * everything that happens here will slow down the page load.
 */

var app = new Router();
nunjucks.configure("templates");

var user;

// Helper functions

// Render a template
function render(template, context) {
  document.write(nunjucks.render(template, context));
}

// Endpoints

app.route("/", function(args) {
  
  getData("users/" + user.uid + "/networks", function(networks) {
    if (!networks) {
      // The user is not yet subscribed to any networks
      render("user.njk", {
        networks: {}
      });
      return;
    }

    // Set the current context to the chosen network, or to the first
    // network in the user's networks if no network is specified.
    var nid;
    if (args && args.nid) {
      nid = args.nid;
    } else {
      nid = Object.keys(networks)[0];
    }

    // The names of the networks are stored with the networks themselves,
    // we use the IDs from the user's networks to key into them
    getData("networks", function(allNetworks) {

      for (var id in networks) {
        networks[id].name = allNetworks[id].name;
      }

      render("user.njk", {
        // An object containing information about the user's networks
        networks: networks,

        current: networks[nid],

        // The ID of the current network context to display on the user's page
        nid: nid

      });
    });
  });
});

firebase.onAuth(function(data) {
  if (data) {
    // The user has an active session
    user = data;

    // Route the request to the proper handlers
    app.handleRequest();

  } else {
    // Prompt the user to login and then return to this page
    render("login.njk", {continue: window.location.href});
  }
});

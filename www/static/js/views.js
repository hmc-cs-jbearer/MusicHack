/**
 * Routing and template rendering. This is not a substitute for server-side
 * logic. This framework should only be used to render templates for various
 * URLs. As much logic as possible should be done by the page as needed, since
 * everything that happens here will slow down the page load.
 */

var app = new Router("templates");

// Endpoints

app.route("/", function(args) {
  
  getData("/users/" + user.uid + "/networks", function(networks) {
    if (!networks) {
      // The user is not yet subscribed to any networks
      app.render("user.njk", {
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
    getData("/networks", function(allNetworks) {

      for (var id in networks) {
        networks[id].name = allNetworks[id].name;
      }

      app.render("user.njk", {
        // An object containing information about the user's networks
        networks: networks,

        current: networks[nid],

        // The ID of the current network context to display on the user's page
        nid: nid

      });
    });
  });
});

app.route("/create-account", function() {
  app.render("register.njk");
});

app.route("/new-network", function() {
  app.render("new-network.njk");
});

app.route("/enter-network", function() {
  app.render("join-network.njk");
});

app.handleRequest();

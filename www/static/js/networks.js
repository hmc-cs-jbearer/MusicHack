const DEFAULT_COIN_COUNT = 5;

function addNetwork() {

  var name =  document.getElementById("networkName").value;
  var security = document.getElementById("security").value;

  getData(["networks", security, name].join("/"), function(network) {
    if (network) {
      // Network already exists
      document.getElementById("error").innerHTML = 
        "Network '" + name + "' already exists.";

    } else {
      network = {
        admins: {}
      };

      // Add the creator of the network as an admin and a user
      network.admins[user.uid] = 1;
      setData(["networks", security, name].join("/"), network, function(){
        joinOpenNetwork();
      });
    }
  });
}

function joinOpenNetwork() {

  var name = document.getElementById("networkName").value;

  getData(["networks", "open", name].join("/"), function(network) {
    console.log(user.uid);
    if (!network) {
      // The network does not exist
      document.getElementById("error").innerHTML = 
        "The network '" + name + "' does not exist.";

    } else if (network.users && user.uid in network.users) {
      // The user is already a member of the network
      document.getElementById("error").innerHTML = 
        "You are already a member of '" + name + "'.";
    } else {

      // Add the new network to the user's networks
      setData(["users", user.uid, "networks", name].join("/"), {
        coins: DEFAULT_COIN_COUNT,
        security: "open"
      }, function() {
        // Add the user to the network's users
        setData(["networks", "open", name, "users", user.uid].join("/"), 1, function() {
          // Redirect to the homepage for the new network
          window.location = "/?nid=" + name;
        });
      });
    }
  });
}

function leaveNetwork(nid) {
  // Get the security of the network
  getData(["users", user.uid, "networks", nid, "security"].join("/"), function(security) {
  
    eraseData(["users", user.uid, "networks", nid].join("/"));
    eraseData(["networks", security, nid, "users", user.uid].join("/"));
    eraseData(["networks", security, nid, "admins", user.uid].join("/"));

    window.location = "/";
  });
}

const DEFAULT_COIN_COUNT = 5;

function addNetwork() {

  var name =  document.getElementById("networkName").value;

  getData("/networks/" + name, function(network) {
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
      setData("/networks/" + name, network, function(){
        joinNetwork();
      });
    }
  });
}

function joinNetwork() {

  var name = document.getElementById("networkName").value;

  getData("/networks/" + name, function(network) {
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
        coins: DEFAULT_COIN_COUNT
      }, function() {
        // Add the user to the network's users
        setData(["networks", name, "users", user.uid].join("/"), 1, function() {
          // Redirect to the homepage for the new network
          window.location = "/?nid=" + name;
        });
      });
    }
  });
}

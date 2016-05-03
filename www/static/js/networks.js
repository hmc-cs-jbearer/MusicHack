const DEFAULT_COIN_COUNT = 5;

function addNetwork() {
  // Create the new network with a unique network ID
  pushData("/networks", {
    "admins": [user.uid],
    "users": [user.uid],
    "name": document.getElementById("networkName").value
  }, function(nid) {

    // Add the new network to the user's networks
    setData("/users/" + user.uid + "/networks/" + nid, {
      coins: DEFAULT_COIN_COUNT,
      is_admin: "true"
    });

    // Redirect to the homepage for the new network
    window.location = "/?nid=" + nid;

  });
}
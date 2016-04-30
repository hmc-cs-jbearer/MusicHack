var express = require("express");
var https = require("https");
var fs = require('fs');
var bodyParser = require("body-parser");
var Firebase = require("firebase");

var templates = require("nunjucks");
templates.configure("templates");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static"));

const DATABASE_URL = "https://musichack16.firebaseio.com/";

// Read the Firebase secret from a file and pass it to the callback
function getFirebaseSecret(callback) {
  fs.readFile('env.txt', 'utf8', callback);
}

/**
 * Get data from firebase. Callback is called on completion, and takes 1
 *argument, namely the JSON object received.
 * 
 * \param path The path where the data is stored, relative to DATABASE_URL.
 * \param callback Function of one argument (the JSON received) called after
 *  the request completes successfully.
 * \auth auth [optional] The authoriation to use for the request (such as a user
 *  token). Defaults to the Firebase secret, which grants root access.
 */ 
function getData(path, callback) {
  if (!auth) {
    getFirebaseSecret(function(error, secret) {
      if (error) {
        console.log(error);
      } else {
        // Use Firebase secret as auth
        getData(path, secret, callback);
        return;
      }
    });
  }

  // We have an auth, go ahead and make the request
  https.get(DATABASE_URL + path + ".json?auth=" + auth, (response) => {
    // Read incoming data from the request
    var data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });

    // Send the data to the callback function
    response.on("end", () => {
      return callback(JSON.parse(data));
    });

  }).on("error", (err) => {
    console.log(err);
  });
}


// creating a new account
app.get("/create-account", function(req, res) {
  res.send(templates.render("register.njk"));
});


app.get("/new-network", function(req,res) {
  res.send(templates.render("new-network.njk"));
});

/*
* \brief    Creates a new network
* \details  Creates a new network, with the user as admin.
*           and updates the user's list of networks.
*           If the network already exists, then this action does nothing
* \TODO     Add meaningful error message if network exists
*/
app.post("/add-network", function(req, res) {

  token = req.body.token;
  network_name = req.body.name;

  var firebase = new Firebase(DATABASE_URL);
  firebase.authWithCustomToken(token, function(error, authData) {
    if (error) {
      console.log("Authentication failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
    }

    // add the network to the user's list of networks making them admin
		var userNetworksRef =
      firebase.child("users").child(authData.uid).child("networks").child(network_name);

		userNetworksRef.set({
      coins: 5,
      is_admin: "true"
		});
		
    // add the user to the network's admins and users
		var networksRef = firebase.child("networks").child(network_name);
		networksRef.set({
			"admins": authData.uid,
		});

    networksRef.child("users").child(authData.uid).set("value");



	}); //end authWithCustomToken


  res.send(templates.render("user.njk"));
}); //end add-network\

/// Send user to "join network" page
app.get("/enter-network", function(req, res) {
	res.send(templates.render("join-network.njk"));
});


/*
* \brief    Adds a user to a network
* \details  Checks if the network exists.  If it does, adds the user to the network
*           and updates the user's list of networks.
* \TODO     If the network doesn't exist, give a useful error message
* \TODO     Instead of manually checking it would be better to update security rules
*           to prevent users from creating a new network, unless they are admins.
* \TODO     Make sure you can't add yourself to a network your already admin/user
*/
app.post("/join-network", function(req, res) {
	var network_name = req.body.name;
  var token = req.body.token;

  console.log(token);

  var firebase = new Firebase(DATABASE_URL);
  firebase.authWithCustomToken(token, function(error, authData) {
    if (error) {
      console.log("Authentication failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
    }

    var networksRef = firebase.child("networks");

    // check if the network already exists
    networksRef.once("value", function(snapshot) {

      if (!snapshot.child(network_name).exists()) {
        console.log("ERROR: network " + network_name + " does not exist");
        res.send(templates.render("user.njk"));
      }
      else {

        // add this user to the network's list of users
        networksRef.child(network_name).child("users").child(authData.uid).set("value");

        // add this network to the user's list of networks
        var userNetworksRef =
          firebase.child("users").child(authData.uid).child("networks").child(network_name);

        userNetworksRef.set({
          coins: 5,
          is_admin: "false"
        });

        res.send(templates.render("user.njk"));
      } //end else
    }); //end once
  }); //end authWithCustomToken

  /// \todo Implement join-network
});



app.get("/forgot-password", function(req, res) {
  /// \todo Implement forgot-password
});

app.post("/search", function(req, res) {
  /// \todo Implement search
});

app.post("/add-to-queue", function(req, res) {
  /// \todo Implement add-to-queue
});

////////////////////////////////////////////////////////////////////////////////
// The below functions have been deprecated and their logic moved to the client
////////////////////////////////////////////////////////////////////////////////

/**
 * \brief This endpoint uses post internally, so a GET request to '/' means that
 *  the user has just navigated to the page. Check to see if they have a saved
 *  session. If so, direct them to their homepage. Otherwise, log them in.
 */
app.get("/", function(req, res) {
  res.send(templates.render("saved-session.njk"));
});

/**
 * \brief Display the users homepage.
 * \param [body] token The user's login token.
 * \param [body, optional] nid The ID of the network to display data for.
 * Defaults to the first network in the user's networks.
 */
app.post("/", function(req, res) {
  var firebase = new Firebase(DATABASE_URL);

  // Get user data so we can personalize their home page
  firebase.authWithCustomToken(req.body.token, function(error, authData) {
    if (error) {
      res.redirect("/login?continue=/&error=Login+error:+" + error);
    } else {
      getData("users/" + authData.uid + "/networks", function(networks) {

        if (!networks) {
          // The user is not yet subscribed to any networks
          res.send(templates.render("user.njk", {
            networks: {}
          }));
          return;
        }

        // Set the current context to the chosen network, or to the first
        // network in the user's networks if no network is specified.
        var nid = req.body.nid || Object.keys(networks)[0];

        res.send(templates.render("user.njk", {
          // An object containing information about the user's networks
          networks: networks,

          current: networks[nid],

          // The ID of the current network context to display on the user's page
          nid: nid

        }));
      }, auth=req.body.token);
    }
  });
});

/**
 * \brief Log in the user.
 * \param [query] continue URL to which the user should be redirected upon
 *  successful login.
 * \param [query] error An error message to display, if any.
 */
app.get("/login", function(req, res) {
  res.send(templates.render("login.njk", {
    continue: req.query.continue,
    error: req.query.error
  } ));
});

/** 
 * Get a JSON object describing the current song. The object has at least the
 * following fields:
 * * name (string): The name of the updated song
 * * artist_name (string)
 * * album_name (string)
 * * image_url (string): The URL of the album art for the song (or some other)
 *  graphics to display while the song is playing)
 *
 * \param [query] token The user's auth token.
 * \param [query] nid The ID of the network from which to request the data.
 */
app.get("/get-current-song", function(req, res) {
  getData("networks/" + req.query.nid + "/queue", function(queue) {
    songId = queue.front;
    songData = queue.songId;

    // The song ID is not stored with the rest of the data since it is the key
    songData.song_id = songId;

    res.send(songData);

  }, auth=req.query.token);
});

/**
 * Get the user's coin count for a given network.
 * \param [query] token The user's auth token.
 * \param [query] nid The ID of the network.
 */
app.get("/coins", function(req, res) {
  var fb = new Firebase(DATABASE_URL);
  fb.authWithCustomToken(req.query.token, function(error, authData) {
    if (error) {
      console.log("Invalid auth in /coins: " + error);
    } else {
      getData("users/" + authData.uid + "/networks/" + req.query.nid + "/coins",
        function(coinCount) {
          res.send(coinCount);
        });
    }
  });
});

app.listen(8080);

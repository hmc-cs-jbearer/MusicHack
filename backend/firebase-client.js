var Firebase = require("firebase");
var fs = require("fs");

const FIREBASE_ROOT = "https://musichack16.firebaseio.com/";
var firebase = new Firebase(FIREBASE_ROOT);

/**
 * Compute the amount by which the requester of a songs coin count should change
 * given the number of upvotes and downvotes on the song.
 */
 function calculateCoinDelta(upvotes, downvotes) {
  /// \todo We want a more sophisticated algorithm here
  return upvotes - downvotes;
 }

/**
 * Update the song requester's coin count when a user upvotes or downvotes the
 *  song.
 * song: a data snapshot of the current song
 * requesterNetwork: a reference to the requester of the song's data for the
 *  relevant network.
 */
function vote(song, requesterNetwork) {

  // Get the upvotes and downvotes
  var upvoters = song.child("upvoters").val();
  var downvoters = song.child("downvoters").val();
  var numUpvotes = upvoters ? Object.keys(upvoters).length : 0;
  var numDownvotes = downvoters ? Object.keys(downvoters).length : 0;

  // Compute the change in the coin count due to this song
  var delta = calculateCoinDelta(numUpvotes, numDownvotes);

  // Update the user's coin count
  var coinsBeforeSong = song.child("coinsBeforeSong").val();
  requesterNetwork.child("coins").set(coinsBeforeSong + delta);

  console.log("Vote cast for song", song.child("data/name").val(),
    "on network", requesterNetwork.key());
}

/**
 * Sync listeners with next song and clean up data from old song
 */
function nextSong(queue, songId) {
  if (!songId) {
    // No song playing right now
    return;
  }

  var song = queue.child(songId);

  // Get the network ID so we can acces the user's data for the network
  // Hierarchy is network->queue->song, and the key for the network is its ID
  var nid = song.parent().parent().key();

  // Get the requester's data for the network of the song
  song.child("requester").once("value", function(requesterID) {
    var requester = firebase.child("users").child(requesterID.val());
    var network = requester.child("networks").child(nid);

    // Here we check if coinsBeforeSong has been set. If not, this song is just
    // starting and we need to set it. If it is set, it means the song has
    // already been playing, and the server has just started or something.
    // In that case we keep the old value.
    song.child("coinsBeforeSong").once("value", function(coinsBeforeSong) {

      if (coinsBeforeSong.exists()) {
        console.log(`Song ${song.key()} currently playing. Coins before:`, coinsBeforeSong.val());

        // Listen for changes in the upvote/downvote list for the new song
        song.on("value", function(song) {
          vote(song, network);
        });
      } else {

        console.log(`Switching to new song ${song.key()}.`);
        
        // Get the user's coin count
        network.child("coins").once("value", function(coins) {
          song.child("coinsBeforeSong").set(coins.val());

          // Only assign listeners after coinsBeforeSong has been set
          song.on("value", function(song) {
            vote(song, network);   
          });
        });
      }
    });
  });
}

/**
 * Set up listeners to handle changes in the data for a single network.
 */
function syncToNetwork(network) {
  // Get a reference to the queue for this network
  var queue = network.ref().child("queue");
  queue.child("front").on("value", function(newFront) {
    // Listen for changes to the current song
    nextSong(queue, newFront.val());
  });
}

/**
 * Add asynchronous event listeners to handle changes in Firebase data.
 */
function addListeners() {
  // sync with each network, and listen for the addition of networks
  firebase.child("networks").child("open").on("child_added", syncToNetwork);
}

/**
 * Initialize the client and listen for changes in the database
 */
function listen() {

  // Read the Firebase secret from a file
  var secret = fs.readFileSync('secret.txt', 'utf8');

  // Authenticate as admin for root privileges
  firebase.authWithCustomToken(secret, function(error) {
    if (error) {
      console.log("Unable to authenticate to Firebase:", error);
      process.exit(1);
    } else {
      // Once authenticated, setup Firebase event listeners
      addListeners();
      console.log("Listening for changes to the Firebase data.");
    }
  });
}

listen();

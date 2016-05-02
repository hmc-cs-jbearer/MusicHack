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
 */
function vote(song) {
  var upvoters = song.child("upvoters").val();
  var downvoters = song.child("downvoters").val();

  // Get the list of upvoters and downvoters
  var numUpvotes = Object.keys(upvoters).length;
  var numDownvotes = Object.keys(downvoters).length;

  // Get the network ID so we can acces the user's data for the network
  // Hierarchy is network->queue->song, and network key is nid
  var nid = song.parent().parent().key();

  // Get the requester of the song
  var requesterID = song.child("requester").val();
  var requester = firebase.child("users").child(requesterID);
  var network = requester.child("networks").child(nid);

  // Delta keeps track of how much this song has changed the coin count
  var delta = song.child("coinDelta").val();
  var coinsBeforeSong = network.child("coins").val() - delta;

  // Compute the coin delta accounting for the new vote
  var newDelta = calculateCoinDelta(numUpvotes, numDownvotes);

  // Update the coin delta and the requester's coin count
  song.child("coinDelta").set(newDelta);
  network.child("coins").set(coinsBeforeSong + newDelta);

}

/**
 * Sync listeners with next song and clean up data from old song
 */
function nextSong(queue, songId) {
  // Listen for changes in the upvote/downvote list for the new songs
  queue.child(songId).child("upvoters").on("value", vote);
  queue.child(songId).child("downvoters").on("value", vote);

  // Keep track of how much this song has changed the requester's coin count
  // Starts at 0 with no upvotes or downvotes
  queue.child(songId).child("coinDelta").set(0);
}

/**
 * Set up listeners to handle changes in the data for a single network.
 */
function syncToNetwork(network) {
  var queue = network.child(queue);
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
  firebase.child("networks").on("child_added", syncToNetwork);
}

/**
 * Initialize the client and listen for changes in the database
 */
function listen() {

  // Read the Firebase secret from a file
  var secret = fs.readFileSync('env.txt', 'utf8');

  // Authenticate as admin for root privileges
  firebase.authWithCustomToken(secret, function(error) {
    if (error) {
      console.log("Unable to authenticate to Firebase:", error);
    } else {
      // Once authenticated, setup Firebase event listeners
      addListeners();
      console.log("Listening.");
    }
  });
}

listen();

/**
 * Javascript interface for controls on the user.html page
 */

/**
 * Update the information displayed on the page with the given data.
 * data should be a JSON object with at least the following fields:
 * * name (string): The name of the updated song
 * * artist_name (string)
 * * album_name (string)
 * * image_url (string): The URL of the album art for the song (or some other)
 *  graphics to display while the song is playing)
 * * song_id: an ID that can be used to get an audio stream for the song
 */
function updateSongData(data, isAdmin=false) {
  document.getElementById("current_song_title").innerHTML = data.name;
  document.getElementById("current_artist_name").innerHTML = data.artist_name;
  document.getElementById("current_album_name").innerHTML = data.album_name;
  document.getElementById("current_album_art").src = data.image_url;

  if (isAdmin) {
      // If the user is an admin, get the stream audio
      /// \todo This is a spotify thing that I don't know how to do yet
  }
}

/**
 * Change the number of coins displayed for the user's account.
 */
function updateCoinCount(newCount) {
  document.getElementById("coins").innerHTML = newCount + "<i class=\"database icon\">\x3C/i>";
}

// Update the page whenever data changes in the network with ID nid
function syncToNetwork(nid) {

  // Get the security of the network
  getData(["users", user.uid, "networks", nid, "security"].join("/"), function(security) {
    // Update the page when the current song changes
    firebase.child(["networks", security, nid, "queue", "front"].join("/")).on("value", function (front) {
      var songId = front.val();

      if (!songId) {
        // No song currently playing
        return;
      }

      // Get the song data
      getData(["networks", security, nid, "queue", songId, "data"].join("/"), function(data) {
        // The song ID is not stored with the rest of the data since it is the key
        data.songId = songId;
        updateSongData(data);
      });
    });
  });

  // Update the page when the user's coin count changes
  firebase.child("users/" + user.uid + "/networks/" + nid + "/coins").on("value", function(coins) {
    updateCoinCount(coins.val());
  });
}

/**
 * Either upvote or downvote the current song on the network with the given ID.
 * addList: either "upvoters" or "downvoters", the list to add a vote to
 * removeList: the complement of addlist (ie either "downvoters" or "upvoters")
 */
function vote(nid, addList, removeList) {

  // Get the security of the network
  getData(["users", user.uid, "networks", nid, "security"].join("/"), function(security) {
  
    var queuePath = ["networks", security, nid, "queue"].join("/");

    // get the song to upvote
    getData([queuePath, "front"].join("/"), function(songId) {
      if (!songId) {
        // No song playing right now
        return;
      }   

      // Just in case the user has already voted and is changing their vote,
      // remove them from the other list
      setData([queuePath, songId, removeList, user.uid].join("/"), null);

      // Add the user's vote
      setData([queuePath, songId, addList, user.uid].join("/"), 1);
    });
  })
}

// Upvote the current song on the network with ID nid
function upvote(nid) {
  vote(nid, "upvoters", "downvoters");
}

// Downvote the current song on the network with ID nid
function downvote(nid) {
  vote(nid, "downvoters", "upvoters");
}

// Advance the network with ID nid to the next song in the queue
function nextSong(nid) {
  $.ajax("/next-song", {
    data: {
      nid: nid,
      token: user.token
    }
  });
}

/**
 * Synchronize with the given network and immediately update the data on the page.
 */
function syncUpdate(nid) {
  syncToNetwork(nid);
}
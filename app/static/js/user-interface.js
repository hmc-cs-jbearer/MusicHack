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
  console.log("Updating song: " + JSON.stringify(data));

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
  console.log("Updating coins: " + newCount);

  document.getElementById("coins").innerHTML = newCount + "<i class=\"database icon\">\x3C/i>";
}

// Update the page whenever data changes in the network with ID nid
function syncToNetwork(nid) {

  // Update the page when the current song changes
  firebase.child("networks/" + nid + "/queue").on("value", function (snapshot) {
    var song_id = snapshot.child("front").val();

    if (!song_id) {
      // No song currently playing
      return;
    }

    var data = snapshot.child(song_id).val();

    // The song ID is not stored with the rest of the data since it is the key
    data.song_id = song_id;

    updateSongData(data);
  });

  // Update the page when the user's coin count changes
  firebase.child("users/" + user.uid + "/networks/" + nid + "/coins").on("value", function(snapshot) {
    updateCoinCount(snapshot.val());
  });
}

// Upvote the current song on the network with ID nid
function upvote(nid) {
  $.ajax("/upvote", {
    data : {
      nid: nid,
      token: user.token
    }
  });
}

// Downvote the current song on the network with ID nid
function downvote(nid) {
  $.ajax("/downvote", {
    data : {
      nid: nid,
      token: user.token
    }
  });
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

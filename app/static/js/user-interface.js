// Update the page whenever data changes in the network with ID nid
function syncToNetwork(nid) {

  // Update the page when the current song changes
  firebase.child("networks/" + nid + "/queue").on("value", function(snapshot) {
    var songId = snapshot.child("front");
    var songData = snapshot.child(songId + "/data").val();
    $("#current_song_title").text(songData.name);
    $("#current_artist_name").text(songData.artist_name);
    $("#current_album_name").text(songData.album_name);
    $("#current_album_art").src = songData.image_url;

    if (firebase.child("networks/" + nid + "/admins").hasChild(user.uid)) {
        // If the user is an admin, get the stream audio
        /// \todo This is a spotify thing that I don't know how to do yet
    }
  });

  // Update the page when the user's coin count changes
  firebase.child("users/" + user.uid + "/networks/" + nid + "/coins").on("value", function(snapshot) {
    $("#coins").innerHTML = snapshot.val() + "<i class=\"database icon\">\x3C/i>";
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

// Advance the network with ID nid to the next song in the queue
function nextSong(nid) {
  $.ajax("/next-song", {
    data: {
      nid: nid,
      token: user.token
    }
  })
}
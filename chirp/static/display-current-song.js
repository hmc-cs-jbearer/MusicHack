setInterval(
  function()
  {
     $.getJSON(
        $SCRIPT_ROOT + '/get-current-song',
        {
          network_id : "{{ network_id }}"
        },
        function(data)
        {
          $("#current_song_title").text(data.name);
          $("#current_atist_name").text(data.artist_name);
          $("#current_album_title").text(data.album_name);
          $("#current_album_art").src = data.image_url;
        });
  },
  1000);
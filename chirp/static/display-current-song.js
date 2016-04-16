setInterval(
  function()
  {
     $.getJSON(
        $SCRIPT_ROOT + '/get-current-song',
        {
          network_id : "{{ nid }}"
        },
        function(data)
        {
          $("#current_song_title").text(data.name);
          $("#current_atist_name").text(data.artist_name);
          $("#current_album_title").text(data.album_name);
          $("#current_album_art").src = data.image_url;
          {% if cur_network.is_admin %}
            $("#player").src = data.audio_url;
          {% endif %}
        });
  },
  1000);
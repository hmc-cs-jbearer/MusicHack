from gmusicapi_dev import Webclient

if __name__ == '__main__':
    cl = Webclient()

    username = raw_input("Username:\t")
    password = raw_input("Password:\t")

    cl.login(username, password)

    # Crush, Before These Crowded Streets
    song_id = 'Tksv4avkkk7dxoqgfw4nmgutsmm'

    print "Audio urls:", cl.get_stream_urls(song_id)
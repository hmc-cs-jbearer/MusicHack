import os

from flask import render_template, redirect, request
from gmusicapi import Mobileclient

from chirp import app

google = None

@app.route("/")
def index():
    return render_template("login.html")
    
@app.route("/login", methods=["POST"])
def login():
    global google
    google = Mobileclient()
    if google.login(request.form.get("username"), request.form.get("password"), Mobileclient.FROM_MAC_ADDRESS):
        return redirect("/home")
    else:
        return render_template("login.html", error="Invalid username or password")

@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/search")
def search():

    # Search for tracks
    results = google.search_all_access(request.args.get("query"), max_results=10)
    songResults = results['song_hits']
    albumResults = results['album_hits']
    artistResults = results['artist_hits']

    track_count = len(songResults)
    print "len:", len(songResults)
    print songResults[0]['track']
    tracks = [{
        "name" : track['title'],
        "artist" : track['artist'],
        "album" : track['album'],
        "image_url" : track['albumArtRef'][0]['url'],
        "audio_url" : google.get_stream_url(track['nid'])
    } for track in [song['track'] for song in songResults]]

    # Search for artists
    artist_count = len(artistResults)
    artists = [{
        "name" : artist['name'],
        "image_url" : artist['artistArtRef'],
        "genre" : "Unknown"
    } for artist in [artist['artist'] for artist in artistResults]]

    # Search for albums
    album_count = len(albumResults)
    albums = [{
        "name" : album['name'],
        "artist" : album['artist'],
        "date" : album['year'] if 'year' in album.keys() else "Unknown",
        "genre" : "Unknown",
        "image_url" : album['albumArtRef']
    } for album in [album['album'] for album in albumResults]]

    return render_template(
        "index.html", track_results=tracks, album_results=albums, artist_results=artists,
        track_count=track_count, album_count=album_count, artist_count=artist_count)

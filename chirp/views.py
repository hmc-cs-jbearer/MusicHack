import os

from flask import render_template, request
from spotipy import Spotify

from chirp import app

sp = Spotify()

@app.route("/")
def index():
    return render_template("index.html")
    
@app.route("/search")
def search():

    # Search for tracks
    results = sp.search(request.args.get("query"), limit=9, type="track")['tracks']
    track_count = results['total']
    items = results['items']
    tracks = [{
        "name" : track['name'],
        "artist" : track['artists'][0]['name'] if track['artists'] else "Unknown",
        "album" : track['album']['name'],
        "image_url" : track['album']['images'][0]['url'] if track['album']['images'] else "",
        "audio_url" : track['preview_url']
    } for track in items]

    # Search for artists
    results = sp.search(request.args.get("query"), limit=9, type="artist")['artists']
    artist_count = results['total']
    items = results['items']
    artists = [{
        "name" : artist['name'],
        "image_url" : artist['images'][0]['url'] if artist['images'] else "",
        "genre" : artist['genres'][0] if artist['genres'] else "Unknown"
    } for artist in items]

    # Search for albums
    results = sp.search(request.args.get("query"), limit=9, type="album")['albums']
    album_count = results['total']
    items = results['items']
    albums = [{
        "name" : album['name'],
        # Have to get the full album object, simplifed has no artists key
        "artist" : album['artists'][0]['name'] if album['artists'] else "Unknown",
        "date" : album['release_date'],
        "genre" : album['genres'][0] if album['genres'] else "Unknown",
        "image_url" : album['images'][0]['url'] if album['images'] else ""
    } for album in map(lambda result: sp.album(result['id']), items)]

    return render_template(
        "index.html", track_results=tracks, album_results=albums, artist_results=artists,
        track_count=track_count, album_count=album_count, artist_count=artist_count)

import os

from firebase import firebase
from flask import render_template, request, redirect, url_for, jsonify
from gmusicapi import Mobileclient, CallFailure

from chirp import app

firebase = firebase.FirebaseApplication('https://musichack16.firebaseio.com/',
                                        None)

google = None

@app.route('/')
def login():
    #return render_template("login.html")
    return redirect("/search?query=warehouse")

@app.route('/new-network')
def new_newtork():
    return render_template("new-network.html")

@app.route('/forgot-password')
def forgot_password():
    return render_template("forgot-password.html")

@app.route('/add-user')
def add_user():
    return render_template("add-user.html")

@app.route('/create-account')
def create_account():
    return render_template("register.html")
    
@app.route('/user')
def user():
    art = "/images/avatar2/large/kristy.png"
    return render_template("user.html")

@app.route('/login-google', methods=['POST'])
def login_google():
    '''
    Prompt the user to log in to Google Play account, and then return to the page that requested
    the login. The URL to return to is given as the 'target' argument of the incoming form.
    '''
    global google

    google = Mobileclient()

    email = request.form.get('email')
    password = request.form.get('password')
    target_url = request.form.get('target_url')
    if google.login(email, password, Mobileclient.FROM_MAC_ADDRESS):
        return redirect(target_url)
    else:
        return render_template("login-google.html", target_url=target_url, error=True)

@app.route('/search')
def search():

    results_per_page = 9

    query = request.args.get("query")

    if not google:
        return render_template("login-google.html", target_url="/search?query=" + query)

    song_results = []
    try:
        song_results = google.search_all_access(query, max_results=results_per_page)['song_hits']
    except CallFailure:
        song_results = google.get_all_songs(incremental=True)[:results_per_page]

    songs = [{
        "name" : track['title'],
        "artist_name" : track['artist'],
        "album_name" : track['album'],
        "image_url" : track['albumArtRef'][0]['url'],
        "id" : track['id'] if 'id' in track.keys() else track['nid']
    } for track in [result['track'] for result in song_results]]

    return render_template("search-results.html", song_results=songs)

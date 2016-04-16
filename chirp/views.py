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
    return render_template("login.html")

@app.route('/login-error')
def login_error():
    return render_template("login.html", error=True)

@app.route('/new-network')
def new_newtork():
    return render_template("new-network.html", uid=uid)

@app.route('/add-network', methods=['POST'])
def add_network():

    uid = request.form.get('uid')
    network_name = request.form.get('name')

    firebase.put('/', network_name, {
        "admin": uid
        })

    return redirect('/user?uid=' + uid)

@app.route('/create-account')
def register():
    print("hello from create-account")
    return render_template("register.html")

@app.route('/forgot-password')
def forgot_password():
    return render_template("forgot-password.html")

@app.route('/add-user')
def add_user():
    return render_template("add-user.html")

@app.route('/create-account')
def create_account():
    return render_template("register.html")
    
@app.route('/choose-network')
def choose_network():
    uid = request.form.get('uid')
    nid = request.form.get('nid')

    if not uid:
        uid = request.args.get('uid')
    if not nid:
        nid = request.args.get('nid')
    
    users = firebase.get("/users", None)
    user_networks = users[uid]["networks"]
    networks = [{
        'name' : user_networks[one_id]['name'],
        'id' : one_id
    } for one_id in user_networks.keys()]

    network=user_networks[nid]

    print network

    return render_template("user.html", nid=nid, cur_network=network, user_networks=networks, uid=uid)

@app.route('/user')
def user():
    uid = request.args.get('uid')
    nid = firebase.get('/users/' + uid + '/networks', None).keys()[0]
    admin = firebase.get('/users/' + uid + '/networks/' + nid + '/is_admin', None)

    return redirect("/choose-network?uid="+uid+"&nid="+nid)

@app.route('/upload-user', methods=["POST"])
def uploud_user():
    print("hello from upload-user")
    
    userid = request.args.get("userid")
    name = request.args.get("name")
    firebase.put('/users', userid,
        {
        "name" : name,
        "coins" : 3
        })
        
    return True

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
    uid = request.args.get("uid")
    nid = request.args.get("nid")

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

    return render_template("search-results.html", song_results=songs, uid=uid, nid=nid)

@app.route('/add-to-queue', methods=['POST'])
def add_to_queue():
    '''
    Add a song to the queue if the user has enough credits.
    Args:
        song_id: the id of the song to add
        uid: the id of the user adding the song
        nid: the id of the network to which to add the song
    '''
    song_id = request.form.get('song_id')
    uid = request.form.get('uid')
    nid = request.form.get('nid')

    points = firebase.get('/users/' + uid + '/networks/' + nid + '/points', None)
    cost = get_song_cost(song_id)
    if points < cost:
        return render_template('unauthoried.html', reason="You can't afford that song!")

    queue = firebase.get('/networks/' + nid + '/queue', None)

    if not queue:
        # create empty queue
        queue['front'] = None
        queue['back'] = None

    back_id = queue['back']
    if back_id:
        queue[back_id]['next'] = song_id
        queue[song_id]['requester'] = uid
        queue['back'] = song_id
    else:
        # Empty queue
        queue['front'] = song_id
        queue['back'] = song_id
        queue[song_id]['requester'] = uid

    firebase.put('/networks/' + nid + '/queue', queue)

    return render_template('user.html', uid=uid)

@app.route('/current-song')
def get_current_song():
    '''
    Get a dictionary representing the currently playing song on the given network.
    Returns None if no song is currently playing
    '''
    network_id = request.args.get('network_id')
    song_id = firebase.get("/networks/" + network_id + "/queue/front", None)
    if song_id:
        return firebase.get("/networks/" + network_id + "queue/" + song_id, 'data')
    else:
        return None

def get_song_cost(song_id):
    return 1

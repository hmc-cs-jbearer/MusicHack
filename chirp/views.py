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

@app.route('/new-network', methods=['POST'])
def new_network():
    uid = request.form.get('uid')
    return render_template("new-network.html", uid=uid)

@app.route('/enter-network', methods=['POST'])
def enter_network():
    uid = request.form.get('uid')
    return render_template("enter-network.html", uid=uid)

@app.route('/add-network', methods=['POST'])
def add_network():
    uid = request.form.get('uid')
    network_name = request.form.get('name')

    firebase.put('/networks', network_name, {
        "admin": uid
        })

    firebase.put('/users/' + uid + '/networks/', network_name,
        {
        "name": network_name,
        "coins": 210,
        "is_admin": "true",
        })

    return redirect('/user?uid=' + uid)

@app.route('/join-network', methods=['POST'])
def join_network():
    uid = request.form.get('uid')
    network_name = request.form.get('name')

    firebase.put('/users/' + uid + '/networks/', network_name,
        {
        "name": network_name,
        "coins": 210,
        "is_admin": "false",
        })

    return redirect('/user?uid=' + uid)

@app.route('/create-account')
def register():
    return render_template("register.html")

#### Creating a new account errors
@app.route('/username-exists')
def username_exists():
    return render_template("register.html", error="username exists")

@app.route('/invalid-email')
def invalid_email():
    return render_template("register.html", error="invalid email")

@app.route('/passwords-dont-match')
def passwords_dont_match():
    return render_template("register.html", error="passwords dont match")

####


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

    # see if the caller specified a network to display
    nid = request.args.get('nid')
    if not nid:
        # if not, just get the first network from the database
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
    nid = request.form.get('nid')
    if nid:
        target_url += "?nid=" + nid

    uid = request.form.get('uid')
    if uid:
        prefix = '&' if nid else '?'
        target_url += prefix +"uid=" + uid

    if google.login(email, password, Mobileclient.FROM_MAC_ADDRESS):
        return redirect(target_url)
    else:
        return render_template("login-google.html", target_url=target_url, error=True)

@app.route('/search', methods=["POST", "GET"])
def search():

    results_per_page = 9

    query = request.form.get("query")
    uid = request.form.get("uid")
    nid = request.form.get("nid")

    if not query:
        query = request.args.get("query")
    if not uid:
        uid = request.args.get("uid")
    if not nid:
        nid = request.args.get("nid")

    print query
    print uid
    print nid

    if not google:
        return render_template("login-google.html", target_url="/search?query=" + query, uid=uid, nid=nid)

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

    coins = firebase.get('/users/' + uid + '/networks/' + nid + '/coins', None)
    cost = get_song_cost(song_id)
    if coins < cost:
        return render_template('unauthorized.html', reason="You can't afford that song!")

    queue = firebase.get('/networks/' + nid + '/queue', None)

    if not queue:
        # create empty queue
        queue = {
            'front' : None,
            'back' : None
        }

    if not queue['back']:
        # Empty queue
        queue['front'] = song_id
        queue['back'] = song_id
        queue[song_id] = {
            'requester' : uid
        }
    else:
        back_id = queue['back']
        queue[back_id]['next'] = song_id

    queue[song_id] = {
        'requester' : uid,
        'data' : {
            'name' : request.form.get('song_name'),
            'artist_name' : request.form.get('artist_name'),
            'album_name' : request.form.get('album_name'),
            'image_url' : request.form.get('image_url')
        }
    }
    queue['back'] = song_id

    firebase.put('/networks/' + nid, 'queue', queue)
    firebase.put('/users/' + uid + '/networks/' + nid, 'coins', coins - 1)

    return redirect('/user?uid='+uid+'&nid='+nid)

@app.route('/prompt-google')
def prompt_google():
    target = request.args.get('target')
    uid = request.args.get('uid')
    nid = request.args.get('nid')
    return render_template("login-google.html", target_url=target, uid=uid, nid=nid)

@app.route('/get-current-song')
def get_current_song():
    '''
    Get a dictionary representing the currently playing song on the given network.
    Returns None if no song is currently playing
    '''
    nid = request.args.get('nid')
    uid = request.args.get('uid')

    if not google:
        return jsonify({
            'redirect' : True,
            'target' : "/user",
            'nid' : nid,
            'uid' : uid
        })

    queue = firebase.get("/networks/" + nid, 'queue')
    if not queue:
        return jsonify({'invalid' : True})

    song_id = queue['front']
    if song_id:
        data = queue[song_id]['data']
        data['audio_url'] = google.get_stream_url(song_id)
        print data
        return jsonify(data)
    else:
        return jsonify({'invalid' : True})

@app.route('/get-next-song')
def get_next_song():
    '''
    Get a dictionary representing the currently playing song on the given network.
    Returns None if no song is currently playing
    '''
    nid = request.args.get('nid')
    uid = request.args.get('uid')

    queue = firebase.get("/networks/" + nid, 'queue')

    if not queue:
        return jsonify({'invalid' : True})

    song_id = queue['front']
    if not song_id:
        return jsonify({'invalid' : True})

    if not queue[song_id]['next']:
        # just played the last song
        queue['front'] = None
        queue['back'] = None
        del queue[song_id]
        firebase.put("/networks/" + nid, 'queue', queue)
        return jsonify({'invalid' : True})

    queue['front'] = queue[song_id]['next']
    del queue[song_id]
    firebase.put("/networks/" + nid, 'queue', queue)

    if not google:
        return jsonify({
            'redirect' : True,
            'target' : "/user",
            'nid' : nid,
            'uid' : uid
        })

    data = queue[queue['front']]['data']
    data['audio_url'] = google.get_stream_url(queue['front'])
    print data
    return jsonify(data)

@app.route("/switch-google", methods=["POST"])
def switch_google():
    global google

    if google:
        google.logout()
        google=None

    uid = request.form.get('uid')
    nid = request.form.get('nid')

    return redirect('/user?uid='+uid+'&nid='+nid)

@app.route('/upvote')
def upvote():
    nid = request.args.get("nid")
    uid = request.args.get("uid") 

    queuePath = "/networks/" + nid + "/queue/"

    # get song from the front of the queue
    song_id = firebase.get(queuePath, "front")

    # make sure the user can only upvote the song once
    upvoters = firebase.get(queuePath + song_id, "upvotes")

    if upvoters:
        keys = upvoters.keys()
        for key in keys:
            if uid == key:
                return jsonify({uid: 2})


    # get requester
    requester = firebase.get(queuePath + song_id + "/", "requester")
    # increments the number of coins (hopefully)
    
    nidPath = "/users/" + requester + "/networks/" + nid + "/"

    numCoins = firebase.get(nidPath, "coins")

    firebase.put(nidPath, "coins", int(numCoins) + 1)

    # adds the userid to the song (hopefully)
    firebase.put(queuePath + song_id + "/upvotes/", uid, "hello")
    
    return jsonify({uid: 2})
    

def get_song_cost(song_id):
    return 1

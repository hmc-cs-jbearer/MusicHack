import os

from firebase import firebase
from flask import render_template, request, redirect, url_for, jsonify
from gmusicapi import Mobileclient

from chirp import app

firebase = firebase.FirebaseApplication('https://musichack16.firebaseio.com/',
                                        None)

google = None

@app.route('/')
def login():
    return render_template("login.html")

@app.route('/new-network')
def new_newtork():
	return render_template("new-network.html")

@app.route('/forgot-password')
def forgot_password():
	return render_template("forgot-password.html")

@app.route('/search')
def search():
    RESULTS_PER_PAGE = 10

    query = request.arg.get("query")

    songResults = []
    try:
        songResults = google.search_all_access(query, max_results=RESULTS_PER_PAGE)
    except:
        songResults = google.get_all_songs(incremental=True)[:RESULTS_PER_PAGE]


import os

from firebase import firebase
from flask import render_template, request, redirect, url_for, jsonify
from gmusicapi import Mobileclient

from app import app

firebase = firebase.FirebaseApplication('https://musichack16.firebaseio.com/',
                                        None)

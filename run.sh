#!/bin/sh

cd backend
node firebase-client.js > firebase-client.log &

cd ..
npm start
#!/bin/sh

cd backend
node firebase-client.js > log.txt &

cd ..
npm start
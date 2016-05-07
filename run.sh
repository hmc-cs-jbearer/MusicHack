#!/bin/sh

mkdir -p log
node backend/firebase-client.js > log/firebase-client.log &
npm start
/*
  Upload the rules defined in firebase-rules-min.json to Firebase. Run
  node minify.js firebase-rules.json first.
*/

var https = require("https");
var data = require("../firebase-rules-min.json");
var fs = require("fs");

var secret = fs.readFileSync("secret.txt", "utf-8");

var options = {
  host: "musichack16.firebaseio.com",
  port: 443,
  path: "/.settings/rules.json?auth=" + secret,
  method: 'PUT'
};

var req = https.request(options);

req.on("error", function(error) {
  console.log("Warning: unable to upload rules to Firebase. Error:", error.message);
});

req.write(JSON.stringify(data));
req.end();
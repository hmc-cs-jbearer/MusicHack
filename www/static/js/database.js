const FIREBASE_ROOT = "https://musichack16.firebaseio.com";
var firebase = new Firebase(FIREBASE_ROOT);

/**
 * Gets a JSON object from the given path relative to FIREBASE_ROOT.
 * Upon success, the callback onSuccess is passed the JSON object. Upon error,
 * an erro message is logged.
 */
function getData(path, onSuccess) {

  var e = new Error('dummy');
  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');
  console.log(stack);

  var reqUrl = FIREBASE_ROOT + path + ".json";

  $.getJSON(reqUrl, {
    auth: user.token
  }, onSuccess)

  .fail(function(jqXHR, status, error) {
    var message = "Tried to GET from " + reqUrl + "with token " + user.token + 
      ", but encountered error:\n";
    if (status) {
      message += (status + ".");
    }
    if (error) {
      message += error + ".";
    }
    console.log(message);
  });
}

/**
 * Enter data into the database at the given path relative to FIREBASE_ROOT.
 * On error, an error message is logged. On success, an optional callback function
 * is called if provided. The callback gets no arguments.
 */
function setData(path, data, callback) {
  var reqUrl = FIREBASE_ROOT + path;

  firebase.child(path).set(data, function(error) {
    if (error) {
      console.log("Tried to POST to " + reqUrl + " , but encountered error:");
      console.log(error + ".");
    }
    else if (callback) {
      callback();
    }
  });
}

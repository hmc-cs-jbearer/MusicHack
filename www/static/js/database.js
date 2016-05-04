const FIREBASE_ROOT = "https://musichack16.firebaseio.com";

var firebase = new Firebase(FIREBASE_ROOT);

function stackTrace() {
  var e = new Error('dummy');
  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');

  // Chop off the first entry, which refers to this helper function
  stack.splice(0, 1);
  return stack;
}

/**
 * Gets a JSON object from the given path relative to FIREBASE_ROOT.
 * Upon success, the callback onSuccess is passed the JSON object. Upon error,
 * an erro message is logged.
 */
function getData(path, onSuccess) {

  var reqUrl = FIREBASE_ROOT + path + ".json";

  // Capture the stack trace in case of error
  var trace = stackTrace();

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
    console.log("Traceback:", trace);
  });
}

/**
 * Enter data into the database at the given path relative to FIREBASE_ROOT.
 * On error, an error message is logged. On success, an optional callback function
 * is called if provided. The callback gets no arguments.
 */
function setData(path, data, callback) {

  // Capture the stack trace in case of error
  var trace = stackTrace();

  firebase.child(path).set(data, function(error) {
    if (error) {
      console.log("Tried to set data at " + path + " , but encountered error:");
      console.log(error + ".");
      console.log("Traceback:", trace);
    }
    else if (callback) {
      callback();
    }
  });
}

/**
 * Create a new child with a unique key at path and store data there.
 * Upon success, the callback function is called and given the new key as an
 * argument.
 */
function pushData(path, data, callback) {
  // Capture the stack trace in case of error
  var trace = stackTrace();

  var ref = firebase.child(path).push(data, function(error) {
    console.log("callback");
    if (error) {
      console.log("Tried to push data at " + path + " , but encountered error:");
      console.log(error + ".");
      console.log("Traceback:", trace);
    }
    else if (callback) {
      callback(ref.key());
    }
  });
}

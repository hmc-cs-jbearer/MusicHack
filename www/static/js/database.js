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
 * Parse a Firebase Error object and return a descriptive string
 */
function formatError(error) {

  var message = error.code;

  var details = "";

  if (error.message) {
    details += error.message + " ";
  }

  if (error.details) {
    details += error.details;
  }

  if (details) {
    message += "\n\nDetails: " + details;
  }

  return message
}

/**
 * Gets a JSON object from the given path relative to FIREBASE_ROOT.
 * Upon success, the callback onSuccess is passed the JSON object. Upon error,
 * an erro message is logged.
 */
function getData(path, onSuccess) {

  // Capture the stack trace in case of error
  var trace = stackTrace();

  firebase.child(path).once("value", function(snapshot) {
    onSuccess(snapshot.val());
  }, function(error) {
    var message = "Tried to get data from " + path + ", but encountered error: ";
    message += formatError(error);
    message += "\n\nTraceback: " + trace;

    console.log(message);
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
      var message = "Tried to set data at " + path + ", but encountered error: ";
      message += formatError(error);
      message += "\n\nTraceback: " + trace;

      console.log(message);
    }
    else if (callback) {
      callback();
    }
  });
}

/**
 * Erase data from the given path. Equivalent to setData(path, null, callback).
 */
function eraseData(path, callback) {
  setData(path, null, callback);
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
      var message = "Tried to push data to " + path + ", but encountered error: ";
      message += formatError(error);
      message += "\n\nTraceback: " + trace;

      console.log(message);
    }
    else if (callback) {
      callback(ref.key());
    }
  });
}

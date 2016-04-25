const FIREBASE_ROOT = "https://musichack16.firebaseio.com/";
var firebase = new Firebase(FIREBASE_ROOT);

/**
 * Gets a JSON object from the given path relative to FIREBASE_ROOT.
 * Upon success, the callback onSuccess is passed the JSON object. Upon error,
 * the callback onError is passed a string describing the problem.
 */
function getData(path, onSuccess, onError) {

  var reqUrl = FIREBASE_ROOT + path;

  $.getJSON(reqUrl, {
    auth: user.token
  }, onSuccess)

  .fail(function(jqXHR, status, error) {
    var message = "Tried to GET from " + reqUrl + ", but encountered error:\n";
    if (status) {
      message += (status + ".");
    }
    if (error) {
      message += console.log(error + ".");
    }
    onError(message);
  });
}

/**
 * Enter data into the database at the given path relative to FIREBASE_ROOT
 */
function setData(path, data) {
  var reqUrl = FIREBASE_ROOT + path;

  $.ajax({
    dataType: "JSON",
    url: reqUrl,
    data: JSON.stringify({
      auth: user.token
    }),
    processData: false,
    method: "POST",
    error: function(jqXHR, status, error) {
      console.log("Tried to POST to " + reqUrl + " , but encountered error:");
      if (status) {
        console.log(status + ".");
      }
      if (error) {
        console.log(error + ".");
      }
    }
  });
}

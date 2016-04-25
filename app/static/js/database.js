const FIREBASE_ROOT = "https://musichack16.firebaseio.com/";
var firebase = new Firebase(FIREBASE_ROOT);

/**
 * Returns a JSON object from the given path relative to FIREBASE_ROOT
 */
function getData(path) {

  console.log("Getting data from " + path);

  var result;
  var reqUrl = FIREBASE_ROOT + path;
  var finished = false;

  $.getJSON(reqUrl, {
    auth: user.token
  }, function(data) {

    console.log("GET succeeded");

    result = data;
    finished = true;
  })
  .fail(function(jqXHR, status, error) {
    console.log("Tried to GET from " + reqUrl + ", but encountered error:");
    if (status) {
      console.log(status + ".");
    }
    if (error) {
      console.log(error + ".");
    }
    finished = true;
  });

  while(!finished) {}

  return result;
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

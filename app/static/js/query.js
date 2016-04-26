/**
 * Gets a JSON object from the given endpoint.
 * Upon success, the callback onSuccess is passed the JSON object. Upon error,
 * an error message is logged.
 * data: a JSON object of key-value pairs which will be parsed and appended to
 *  the url of the request.
 */
function get(endpoint, data, onSuccess) {

  var reqUrl = endpoint;

  $.getJSON(reqUrl, data, onSuccess)
  .fail(function(jqXHR, status, error) {
    var message = "Tried to GET from " + reqUrl + ", but encountered error:\n";
    if (status) {
      message += (status + ".");
    }
    if (error) {
      message += (error + ".");
    }
    console.log(message);
  });
}

/**
 * Posts to the given endpoint.
 */
function post(endpoint, data) {
  $.ajax({
    dataType: "JSON",
    url: endpoint,
    data: data,
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

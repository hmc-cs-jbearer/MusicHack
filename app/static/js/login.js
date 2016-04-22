/**
 * Verify that the user is logged in.
 * If they are not, redirect to the login page.
 * If they are, send data to a callback function. The data is a JSON object with
 * the following fields:
 * * uid: a unique user ID
 * * token: a Firebase token for the user
 * * expires: the time at which the user's session expires, in seconds since the
 *  unix epoch.
 * * auth: a JSON object with the contents of token.
 * * provider: a string representing the login provider (e.g "google")
 * The object may contain additional fields specific to the provider. See
 * Firebase documentation.
 */
 function checkLogin(callback) {
    var database = new Firebase("https://musichack16.firebaseio.com/");

    var auth = database.getAuth();
    if (auth) {
        callback(auth);
    }
    else {
        window.location = "/login?continue=" + window.location;
    }
 }
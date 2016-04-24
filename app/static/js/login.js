/**
 * A JSON object describing the current user. Contains the following fields:
 * * uid: a unique user ID
 * * token: a Firebase token for the user
 * * expires: the time at which the user's session expires, in seconds since the
 *  unix epoch.
 * * auth: a JSON object with the contents of token.
 * * provider: a string representing the login provider (e.g "google")
 * The object may contain additional fields specific to the provider. See
 * Firebase documentation.
 */
 var user;

var firebase = new Firebase("https://musichack16.firebaseio.com/");

firebase.onAuth(function(authData) {
    if (authData) {
        user = authData;

        // Enable forms to use hidden inputs to pass token around
        for (var element in document.getElementsByName("token")) {
            element.value = user.token;
        }
    }
    else {
         window.location = "/login?continue=" + window.location;
    }
});

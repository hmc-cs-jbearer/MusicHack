/**
 * user: A JSON object describing the current user. Contains the following fields:
 * * uid: a unique user ID
 * * token: a Firebase token for the user
 * * expires: the time at which the user's session expires, in seconds since the
 *  unix epoch.
 * * auth: a JSON object with the contents of token.
 * * provider: a string representing the login provider (e.g "google")
 * The object may contain additional fields specific to the provider. See
 * Firebase documentation.
 */
var user = null;

/**
 * Called on page load and ever time the user's authorization status
 *  changes. Check that the user is logged in, and redirect to the
 *  login page if necessary. If user is logged in, save user data
 *  for later use by the page.
 */
firebase.onAuth(function(authData) {

  console.log("Attempting login.");

  if (authData) {
    console.log("Existing session found.");
    user = authData;

    // Enable forms to use hidden inputs to pass token around
    var tokenInputs = document.getElementsByName("token");
    for (var i = 0; i < tokenInputs.length; i++) {
      tokenInputs[i].value = user.token;
    }
  } else {
    console.log("Redirecting");
    window.location = "/login?continue=" + window.location;
  }
});

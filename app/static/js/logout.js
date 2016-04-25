/**
 * End the user's session. When the session ends, the onAuth callback associated
 * with the Firebase reference will fire, causing the user to be redirected to
 * the login page.
 */
function logout() {
  firebase.unauth();
}
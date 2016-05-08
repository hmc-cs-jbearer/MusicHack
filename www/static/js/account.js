/*
  Basic functions for the creation and management of accounts
*/

/**
 * Log in a user given an email and a password.
 * Upon successful login, the user is redirected to the URL given by redirect.
 */
function login(redirect) {

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.authWithPassword({
    email    : email,
    password : password
  }, function(error, user) {
    if (error) {
      document.getElementById("error").innerHTML = "Invalid email or password.";
      console.log("Error logging in:", error);
    } else {
      window.location = redirect;
    }
  });
}

/**
 * Create a new account given an email and a password. checkPassword must match
 * password. The email must not belong to an existing account.
 * Upon success, the user is redirected to their new home page.
 */
function register() {

  var password = document.getElementById("password").value;
  var checkPassword = document.getElementById("checkPassword").value;
  var email = document.getElementById("email").value;
  var name = document.getElementById("name").value;

  if (password !== checkPassword) {
    document.getElementById("error").innerHTML=
      "Make sure you type your password correctly both times!";
      return;
  }

  firebase.createUser({
    email    : email,
    password : password
  }, function(error, user) {
    if (error) {
      switch (error.code) {
      case "EMAIL_TAKEN":
        document.getElementById("error").innerHTML =
          "Sorry. An account already exists with that email.";
        break;
      case "INVALID_EMAIL":
        document.getElementById("error").innerHTML = 
          "Please enter a valid email address.";
        break;
      default:
        console.log("Error creating user:", error);
        document.getElementById("error").innerHTML =
          "Uh oh. Looks like there was an error.";
      }
    } else { 

      // Authenticate the new user
      firebase.authWithPassword({
        email    : email,
        password : password
      }, function(error, user) {
        if (error) {
          console.log("Error logging in new user:", error);
        } else {

          // Add the new user to the database
          setData("users/" + user.uid, {
            name: name,
            email: email
          }, function() {
            // Proceed to the home page
            window.location = "/";
          });
        }
      });
    }
  });
}


/**
 * Send the user an email by which they can change the password for their
 * account.
 */
function resetPassword() {
  firebase.resetPassword({
    email: document.getElementById("email").value
  }, function(error) {
    if (error) {
      switch (error.code) {
      case "INVALID_USER":
        document.getElementById("error").innerHTML = 
          "We can't find an account with that email.";
        break;
      default:
        document.getElementById("error").innerHTML = 
          "Error resetting password: " + error;
      }
    } else {
      document.location = "/public/password-reset-success";
    }
  });
}

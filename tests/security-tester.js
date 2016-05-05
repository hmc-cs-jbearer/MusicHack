(function() {
"use strict";

var Tester = require('firebase-security-tester');

/*
  Unit testing framework for Firebase rules. All assert functions print an
  error message if the test fails, or do nothing if the test passes. Recursive
  asserts run the test on the given path and all of its children.
  status prints a summary of the tests run so far.
*/

class SecurityTester {

  constructor(testData, rules) {
    this.data = testData;
    this.tester = new Tester(testData, rules);
    this.numFailed = 0;
  }

  /**
   * Passes iff the specified user can read data at path.
   */
  assertCanRead(user, path) {
    this.tester.setAuth({uid: user});
    var result = this.tester.canRead(path);
    if (!result.value) {
      // Could not read, gather failure information
      var error = "Test failed. User " + user + " could not read data from " + path;
      error += "\nDenied auth by each of the following rules:\n\n";
      for (var rule in result.results) {
        error += rule.url + ": " + rule.rule + "\n";
      }

      console.log(error);
      this.numFailed++;
    }
  }

  /**
   * Passes iff the specified user cannot read data at path.
   */
  assertCannotRead(user, path) {
    this.tester.setAuth({uid: user});
    var result = this.tester.canRead(path);
    if (result.value) {
      // Actually could read, gather failure information
      var error = "Test failed. User " + user + " could read data from " + path;
      error += "\nGranted auth by the following rule:\n\n";
      rule = result.results[result.results.length - 1];
      error += rule.url + ": " + rule.rule + "\n";

      console.log(error);
      this.numFailed++;
    }
  }

  /**
   * Passes iff the specified user can write the given data at path.
   */
  assertCanWrite(user, path, newData) {
    this.tester.setAuth({uid: user});
    var result = this.tester.canWrite(path, newData);
    if (!result.value) {
      // Could not write, gather failure information
      var error = "Test failed. User " + user + " could not write data to " + path;
      error += "Data to be written was:\n" + newData;
      error += "\nDenied auth by each of the following rules:\n\n";
      for (var rule in result.results) {
        error += rule.url + ": " + rule.rule + "\n";
      }

      console.log(error);
      this.numFailed++;
    }
  }

  /**
   * Passes iff the specified user cannot write the given data at path.
   */
  assertCannotWrite(user, path, newData) {
    this.tester.setAuth({uid: user});
    var result = this.tester.canWrite(path, newData);
    if (result.value) {
      // Actually could write, gather failure information
      var error = "Test failed. User " + user + " could write data to " + path;
      error += "Datawritten was:\n" + newData;
      error += "\nGranted auth by the following rule:\n\n";
      rule = result.results[result.results.length - 1];
      error += rule.url + ": " + rule.rule + "\n";

      console.log(error);
      this.numFailed++;
    }
  }

  assertRecursive(test, user, path, newData) {

    this[test](user, path, newData);

    // Add a trailing slash if necessary. Makes augmenting the path simpler
    if (path[path.length - 1] != "/") {
      path += "/";
    }

    // Parse the url
    var keys = path.split("/");
    var data = this.data;

    // Navigate to the record indicated by path
    for (var key in keys) {
      if (key) data = data.key;
    }

    // Test each child of data
    for (var child in data) {
      this.assertRecursive(test, user, path + child);
    }
  }

  /**
   * Return a string representing the status of the tests (num failed or "All
   *  tests passed")
   */
   status() {
    if (this.numFailed) {
      return "Failed ${this.numFailed} tests.";
    } else {
      return "All tests passed!";
    }
   }
}

module.exports = SecurityTester;

})();
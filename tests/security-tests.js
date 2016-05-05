const SecurityTester = require("./security-tester.js");
const fs = require("fs");
var jsonminify = require("jsonminify");

var loadJSON = (file) => JSON.parse(jsonminify(fs.readFileSync(file, "utf-8")));

const testData = loadJSON("testData.json").root;
const rules = loadJSON("../firebase-rules.json").rules;

var test = new SecurityTester(testData, rules);

// Users can read their own data
for (var user in testData.users) {
  test.assertRecursive("assertCanRead", "user", "/users/${user}/");
}

// Users cannot read other users' data
for (var user in testData.users) {
  for (var otherUser in testData.users) {
    if (user == otherUser) continue;

    test.assertRecursive("assertCannotRead", "user", "/users/${otherUser}/");
  }
}

console.log(test.status());

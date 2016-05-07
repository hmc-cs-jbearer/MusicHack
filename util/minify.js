/**
 * Minify json files. If the input file is my-data.json, the program outputs
 * a minified version my-data-min.json
 */

var fs = require("fs");
var jsonminify = require("jsonminify");

process.argv.slice(2).forEach(function(filename) {
  // Minify and condense extra space which arise from tab stops
	var minified = jsonminify(fs.readFileSync(filename, "utf-8")).replace(/ +/gi, " ");
	var newFilename = filename.replace(".json", "-min.json");
	fs.writeFile(newFilename, minified);
});

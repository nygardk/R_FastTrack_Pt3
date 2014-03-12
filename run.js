if (null == process.argv[2]) {
  console.log("you must provide a filename to process"
              + "\nFor example: 'node run.js tree.txt'");
  process.exit(1);
}

var fileToProcess = process.argv[2];

var fs = require('fs'),
  readline = require('readline'),
  solution = require('./solution');

var rd = readline.createInterface({
  input: fs.createReadStream(fileToProcess),
  output: process.stdout,
  terminal: false
});

var tree = [];

rd.on('line', function(line) {
  if (line.indexOf('#') === -1) // simple comment skipping
    tree.push(line.split(" "));
});

rd.on('close', function() {
  solution.findSolution(tree);
});

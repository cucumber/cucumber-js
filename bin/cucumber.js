#!/usr/bin/env node
var Cucumber = require('../lib/cucumber');
var cli = Cucumber.Cli(process.argv);
cli.run(function(succeeded) {
  var code = succeeded ? 0 : 1;
  var exitFunction = function() {
    process.exit(code);
  };

  // --- exit after waiting for all pending output ---
  var waitingIO = false;
  process.stdout.on('drain', function() {
    if (waitingIO) {
      // the kernel buffer is now empty
      exitFunction();
    }
  });
  if (process.stdout.write("")) {
    // no buffer left, exit now:
    exitFunction();
  } else {
    // write() returned false, kernel buffer is not empty yet...
    waitingIO = true;
  }
});

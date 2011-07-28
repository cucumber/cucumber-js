#!/usr/bin/env node
var fs              = require('fs');
var Cucumber        = require('./lib/cucumber');
var featurePath     = process.ARGV[2];
var supportCodePath = process.ARGV[3] ? process.cwd() + '/' + process.ARGV[3] : './features/step_definitions/cucumber_steps';

if (typeof(featurePath) == 'undefined') {
  throw("Please give me a feature, try something like `" + process.ARGV[1] + " features/cucumber-features/core.feature`.");
}

var supportCode     = require(supportCodePath);
var cucumber        = Cucumber(fs.readFileSync(featurePath), supportCode);
var formatter       = Cucumber.Listener.ProgressFormatter();
cucumber.attachListener(formatter);
cucumber.start(function(succeeded) {
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

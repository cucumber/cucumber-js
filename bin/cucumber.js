#!/usr/bin/env node
var Cucumber = require('../lib/cucumber');
var cli = Cucumber.Cli(process.argv);
cli.run(function (succeeded) {
  var code = succeeded ? 0 : 1;

  process.on('exit', function () {
    process.exit(code);
  });

  var timeoutId = setTimeout(function () {
    console.error('Cucumber process timed out after waiting 60 seconds for the node.js event loop to empty.  There may be a resource leak.  Have all resources like database connections and network connections been closed properly?');
    process.exit(code);
  }, 60 * 1000);

  if (timeoutId.unref) {
    timeoutId.unref();
  }
  else {
    clearTimeout(timeoutId);
  }
});

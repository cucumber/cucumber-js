#!/usr/bin/env node
var Cucumber = require('../lib/cucumber');
var cli = Cucumber.Cli(process.argv);
cli.run(function (succeeded) {
  var code = succeeded ? 0 : 1;

  function exitNow() {
    process.exit(code);
  }

  if (process.stdout.write('')) {
    exitNow();
  } else {
    // write() returned false, kernel buffer is not empty yet...
    process.stdout.on('drain', exitNow);
  }
});

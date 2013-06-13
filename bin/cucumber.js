#!/usr/bin/env node
var Cucumber = require('../lib/cucumber');
var cli = Cucumber.Cli(process.argv);
cli.run(function(succeeded) {
  var code = succeeded ? 0 : 1;

  process.on('exit', function() {
    process.exit(code);
  });
});

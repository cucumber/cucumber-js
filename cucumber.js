#!/usr/bin/env node
var fs                = require('fs');
var Cucumber          = require('./lib/cucumber');
var supportCodePath   = process.ARGV[3] ? process.cwd() + '/' + process.ARGV[3] : './features/step_definitions/cucumber_steps';
var supportCode       = require(supportCodePath);
var cucumber          = Cucumber(fs.readFileSync(process.ARGV[2]), supportCode);
var progressFormatter = Cucumber.Listener.ProgressFormatter;
cucumber.attachListener(progressFormatter());
cucumber.start(function() {});

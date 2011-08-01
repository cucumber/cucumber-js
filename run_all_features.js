#!/usr/bin/env node
var fs       = require('fs');
var util     = require('util');
var spawn    = require('child_process').spawn;

runFeaturesInDir('features/legacy', 'features/step_definitions/legacy/cucumber_steps.js', function() {
  runFeature('features/cucumber-features/core.feature', 'features/step_definitions/cucumber_steps.js', function() {
    runFeature('features/cucumber-features/failing_steps.feature', 'features/step_definitions/cucumber_steps.js', function() {
    });
  });
});


function runFeaturesInDir(dir, stepDefsFile, callback) {
  var featureFiles = findFeaturesInDir(dir);

  function processOne() {
    var featureFile = featureFiles.shift();
    if (featureFile) {
      runFeature(dir + '/' + featureFile, stepDefsFile, function() { processOne(featureFiles); });
    }
    else
      callback();
  };
  processOne();
}

function runFeature(featureFile, stepDefsFile, callback) {
  var cucumber = spawn('./cucumber.js', [featureFile, stepDefsFile]);

  cucumber.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  cucumber.stderr.on('data', function (data) {
    process.stderr.write(data);
  });

  cucumber.on('exit', function (code) {
    if (code > 0)
      process.stderr.write(featureFile + ' failed with code ' + code + "\n");
    callback();
  });
}

function findFeaturesInDir(dir) {
  var files = fs.readdirSync(dir);
  var featureFiles = [];
  var len = files.length;
  for (var i = 0; i < len; i++) {
    var file = files[i];
    if (/\.feature$/.test(file))
      featureFiles.push(file);
  }
  return featureFiles;
}

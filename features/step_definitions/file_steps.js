var cliSteps = function cliSteps() {
  var assert = require('assert');
  var colors = require('colors/safe');
  var execFile = require('child_process').execFile;
  var fs = require('fs');
  var fsExtra = require('fs-extra');
  var path = require('path');

  var executablePath = path.join(__dirname, '..', '..', 'bin', 'cucumber.js');

  this.Given(/^a file named "(.*)" with:$/, function(filePath, fileContent, callback) {
    var absoluteFilePath = path.join(this.tmpDir, filePath);
    fsExtra.outputFile(absoluteFilePath, fileContent, callback);
  });

  this.Given(/^a directory named "(.*)"$/, function(filePath, callback) {
    var absoluteFilePath = path.join(this.tmpDir, filePath);
    fsExtra.mkdirp(absoluteFilePath, callback);
  });

  this.Then(/^the file "([^"]*)" has the text:$/, function (filePath, expectedContent, callback) {
    var absoluteFilePath = path.join(this.tmpDir, filePath);
    fs.readFile(absoluteFilePath, 'utf8', function (err, content){
      if (err) { return callback(err); }

      actualContent = normalizeText(content);
      expectedContent = normalizeText(expectedContent);

      if (actualContent != expectedContent)
        throw new Error("Expected " + filePath + " to have content matching:\n'" + expectedContent + "'\n" +
                        "Got:\n'" + actualContent + "'.\n");
      callback();
    })
  });

  function neutraliseVariableValuesInJson(report) {
    report.forEach(function (item) {
      (item.elements || []).forEach(function (element) {
        (element['steps'] || []).forEach(function (step) {
          if ('result' in step) {
            if ('error_message' in step.result) {
              step.result.error_message = "<error-message>";
            }

            if ('duration' in step.result) {
              step.result.duration = "<duration>";
            }
          }
        });
      });
    });
  };

  function normalizeText(text) {
    return text.replace(/\033\[[0-9;]*m/g, "")
      .replace(/\r\n|\r/g, "\n")
      .replace(/^\s+/g, "")
      .replace(/\s+$/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\\/g, "/")
      .replace(/\d+m\d{2}\.\d{3}s/, '<duration-stat>');
  }

  function getAdditionalErrorText(lastRun) {
    return "Error:\n'" + lastRun['error'] + "'.\n" +
           "stderr:\n'" + lastRun['stderr'] + "'.";
  }
};

module.exports = cliSteps;

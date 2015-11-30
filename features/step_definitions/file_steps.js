var cliSteps = function cliSteps() {
  var assert = require('assert');
  var fs = require('fs');
  var fsExtra = require('fs-extra');
  var path = require('path');

  var helpers = require('../support/helpers');
  var normalizeText = helpers.normalizeText;

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

      var actualContent = normalizeText(content);
      expectedContent = normalizeText(expectedContent);

      assert.equal(actualContent, expectedContent);
      callback();
    });
  });
};

module.exports = cliSteps;

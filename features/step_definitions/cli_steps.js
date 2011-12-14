var cliSteps = function cliSteps() {
  var fs              = require('fs');
  var rimraf          = require('rimraf');
  var mkdirp          = require('mkdirp');
  var exec            = require('child_process').exec;

  var baseDir         = fs.realpathSync(__dirname + "/../..");
  var tmpDir          = baseDir + "/tmp/cucumber-js-sandbox";
  var cleansingNeeded = true;

  var lastRun;

  function tmpPath(path) {
    return (tmpDir + "/" + path);
  };

  function cleanseIfNeeded() {
    if (cleansingNeeded) {
      try { rimraf.sync(tmpDir); } catch(e) {}
      lastRun         = { error: null, stdout: "", stderr: "" };
      cleansingNeeded = false;
    }
  };

  this.Given(/^a file named "(.*)" with:$/, function(filePath, fileContent, callback) {
    cleanseIfNeeded();
    var absoluteFilePath = tmpPath(filePath);
    var filePathParts    = absoluteFilePath.split('/');
    var fileName         = filePathParts.pop();
    var dirName          = filePathParts.join('/');
    mkdirp(dirName, 0755, function(err) {
      if (err) { throw new Error(err); }
      fs.writeFile(absoluteFilePath, fileContent, function(err) {
        if (err) { throw new Error(err); }
        callback();
      });
    });
  });

  this.When(/^I run `cucumber.js(| .+)`$/, function(args, callback) {
    var initialCwd = process.cwd();
    process.chdir(tmpDir);
    var command = baseDir + "/bin/cucumber.js" + args;
    exec(command,
         function (error, stdout, stderr) {
           lastRun['error']  = error;
           lastRun['stdout'] = stdout;
           lastRun['stderr'] = stderr;
           process.chdir(initialCwd);
           cleansingNeeded = true;
           callback();
         });
  });

  this.Then(/^it should pass with:$/, function(expectedOutput, callback) {
    var actualOutput = lastRun['stdout'];
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.");
    callback();
  });

  this.Then(/^I see the version of Cucumber$/, function(callback) {
    var Cucumber       = require('../../lib/cucumber');
    var actualOutput   = lastRun['stdout'];
    var expectedOutput = Cucumber.VERSION + "\n";
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.");
    callback();
  });

  this.Then(/^I see the help of Cucumber$/, function(callback) {
    var actualOutput   = lastRun['stdout'];
    var expectedOutput = "Usage: cucumber.js ";
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.");
    callback();
  });
};
module.exports = cliSteps;

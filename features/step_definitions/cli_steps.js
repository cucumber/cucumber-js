var cliSteps = function cliSteps() {
  var fs              = require('fs');
  var rimraf          = require('rimraf');
  var mkdirp          = require('mkdirp');
  var exec            = require('child_process').exec;

  var baseDir         = fs.realpathSync(__dirname + "/../..");
  var tmpDir          = baseDir + "/tmp/cucumber-js-sandbox";
  var cleansingNeeded = true;

  function tmpPath(path) {
    return (tmpDir + "/" + path);
  }

  function cleanseIfNeeded() {
    if (cleansingNeeded) {
      try { rimraf.sync(tmpDir); } catch(e) {}
      cleansingNeeded = false;
    }
  }

  function isWindowsPlatform() {
    return (process.platform == 'win32' || process.platform == 'win64');
  }

  function joinPathSegments(segments) {
    var pathJoiner = isWindowsPlatform() ? "\\" : '/';
    return segments.join(pathJoiner);
  }

  this.Given(/^a file named "(.*)" with:$/, function(filePath, fileContent, callback) {
    cleanseIfNeeded();
    var absoluteFilePath = tmpPath(filePath);
    var filePathSegments = absoluteFilePath.split('/');
    var fileName         = filePathSegments.pop();
    var dirName          = joinPathSegments(filePathSegments);
    mkdirp(dirName, 0755, function(err) {
      if (err) { throw new Error(err); }
      fs.writeFile(absoluteFilePath, fileContent, function(err) {
        if (err) { throw new Error(err); }
        callback();
      });
    });
  });

  this.When(/^I run `cucumber.js(| .+)`$/, function(args, callback) {
    var world = this;

    var initialCwd = process.cwd();
    process.chdir(tmpDir);
    var runtimePath = joinPathSegments([baseDir, 'bin', 'cucumber.js']);
    var command     = "node \"" + runtimePath + "\"" + args;
    exec(command,
         function (error, stdout, stderr) {
           world.lastRun = {
             error:  error,
             stdout: stdout,
             stderr: stderr
           };
           process.chdir(initialCwd);
           cleansingNeeded = true;
           callback();
         });
  });

  this.Then(/^the exit status should be ([0-9]+)$/, function (code, callback) {
    var world = this;

    var actualCode = world.lastRun.error ? world.lastRun.error.code : "0";

    if (actualCode != code) {
      throw new Error("Exit code expected: \"" + code + "\"\nGot: \"" + actualCode + "\"\n");
    }

    callback();
  });

  this.Then(/^it outputs this json:$/, function(expectedOutput, callback) {
    var world = this;

    var actualOutput = world.lastRun['stdout'];

    expectedOutput = expectedOutput.replace(/<current-directory>/g, tmpDir.replace(/\\/g,'/'));

    try { var actualJson = JSON.parse(actualOutput.replace(/\\\\/g,'/')); }
    catch(err) { throw new Error("Error parsing actual JSON:\n" + actualOutput + "\n" + getAdditionalErrorText(world.lastRun)); }

    try { var expectedJson = JSON.parse(expectedOutput); }
    catch(err) { throw new Error("Error parsing expected JSON:\n" + expectedOutput + "\n" + getAdditionalErrorText(world.lastRun)); }

    neutraliseVariableValuesInJson(actualJson);
    neutraliseVariableValuesInJson(expectedJson);

    var actualJsonString = JSON.stringify(actualJson, null, 2);
    var expectedJsonString = JSON.stringify(expectedJson, null, 2);

    if (actualJsonString != expectedJsonString)
      throw new Error("Expected output to match the following:\n'" + expectedJsonString + "'\n" +
                      "Got:\n'" + actualJsonString + "'.\n" +
                      getAdditionalErrorText(world.lastRun));
    callback();
  });

  this.Then(/^it outputs this text:$/, function(expectedOutput, callback) {
    var world = this;

    var actualOutput = world.lastRun['stdout'];

    expectedOutput = expectedOutput.replace(/<current-directory>/g, tmpDir.replace(/\\/g,'/'));

    actualOutput = normalizeText(actualOutput);
    expectedOutput = normalizeText(expectedOutput);

    if (actualOutput != expectedOutput)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\n" +
                      "Got:\n'" + actualOutput+ "'.\n" +
                      getAdditionalErrorText(world.lastRun));
    callback();
  });

  this.Then(/^I see the version of Cucumber$/, function(callback) {
    var world = this;

    var Cucumber       = require('../../lib/cucumber');
    var actualOutput   = world.lastRun['stdout'];
    var expectedOutput = Cucumber.VERSION + "\n";
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.");
    callback();
  });

  this.Then(/^I see the help of Cucumber$/, function(callback) {
    var world = this;

    var actualOutput   = world.lastRun['stdout'];
    var expectedOutput = "Usage: cucumber.js ";
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.");
    callback();
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
      .replace(/[ \t]+\n/g, "\n");
  }

  function getAdditionalErrorText(lastRun) {
    return "Error:\n'" + lastRun['error'] + "'.\n" +
           "stderr:\n'" + lastRun['stderr'] + "'.";
  }
};

module.exports = cliSteps;

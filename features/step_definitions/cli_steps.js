var cliSteps = function cliSteps() {
  var fs              = require('fs');
  var rimraf          = require('rimraf');
  var mkdirp          = require('mkdirp');
  var exec            = require('child_process').exec;

  var baseDir         = fs.realpathSync(__dirname + "/../..");
  var tmpDir          = baseDir + "/tmp/cucumber-js-sandbox";
  var cleansingNeeded = true;

  var lastRun = { error: null, stdout: "", stderr: "" };

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

  function isWindowsPlatform() {
    return (process.platform == 'win32' || process.platform == 'win64');
  };

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
    var initialCwd = process.cwd();
    process.chdir(tmpDir);
    var runtimePath = joinPathSegments([baseDir, 'bin', 'cucumber.js']);
    var command     = "node \"" + runtimePath + "\"" + args;
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

    var actualError =  lastRun['error'];
    var actualStderr =  lastRun['stderr'];

    if (actualOutput.indexOf(expectedOutput) == -1)
      throw new Error("Expected output to match the following:\n'" + expectedOutput + "'\nGot:\n'" + actualOutput + "'.\n" +
                      "Error:\n'" + actualError + "'.\n" +
                      "stderr:\n'" + actualStderr  +"'.");
    callback();
  });

  this.Given(/^CUCUMBER_JS_HOME environment variable has been set to the cucumber\-js install dir$/, function(callback) {
    // This is needed to allow us to check the error_message produced for a failed steps which includes paths which
    // contain the location where cucumber-js is installed.
    if (process.env.CUCUMBER_JS_HOME) {
      callback();
    } else {
      callback.fail(new Error("CUCUMBER_JS_HOME has not been set."));
    }
  });

  this.Then(/^it should output this json:$/, function(expectedOutput, callback) {
    var actualOutput = lastRun['stdout'];

    var actualError =  lastRun['error'];
    var actualStderr =  lastRun['stderr'];

    try {
        var actualJson = JSON.parse(actualOutput);
    }    
    catch(err) {
        throw new Error("Error parsing actual JSON:\n" + actualOutput);
    }

    if (expectedOutput.indexOf('$CUCUMBER_JS_HOME') != -1) {
      if (!process.env.CUCUMBER_JS_HOME) {
        callback.fail(new Error("CUCUMBER_JS_HOME has not been set."));
      } else {
        expectedOutput = expectedOutput.replace(/\$CUCUMBER_JS_HOME/g, process.env.CUCUMBER_JS_HOME);
        }
    }

    try {
        var expectedJson = JSON.parse(expectedOutput);
    }
    catch(err) {
        throw new Error("Error parsing expected JSON:\n" + expectedOutput); 
    } 

    var actualJsonString = JSON.stringify(actualJson, null, 2);
    var expectedJsonString = JSON.stringify(expectedJson, null, 2);

    if (actualJsonString != expectedJsonString)
      throw new Error("Expected output to match the following:\n'" + expectedJsonString + "'\nGot:\n'" + actualJsonString + "'.\n" +
                      "Error:\n'" + actualError + "'.\n" +
                      "stderr:\n'" + actualStderr  +"'.");
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

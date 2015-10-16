var cliSteps = function cliSteps() {
  var colors = require('colors/safe');
  var execFile = require('child_process').execFile;
  var path = require('path');

  var helpers = require('../support/helpers');
  var normalizeText = helpers.normalizeText;
  var getAdditionalErrorText = helpers.getAdditionalErrorText;

  var executablePath = path.join(__dirname, '..', '..', 'bin', 'cucumber.js');

  this.When(/^I run cucumber.js(?: from the "([^"]*)" directory)?(?: with `(|.+)`)?$/, {timeout: 10000}, function(dir, args, callback) {
    args = args || '';
    var world = this;
    var cwd = dir ? path.join(this.tmpDir, dir) : this.tmpDir;

    execFile(executablePath, args.split(' '), {cwd: cwd}, function (error, stdout, stderr) {
       world.lastRun = {
         error:  error,
         stdout: colors.strip(stdout),
         stderr: stderr
       };
       callback();
     });
  });

  this.Then(/^it passes$/, function () {
    if (this.lastRun.error) {
      throw new Error('Expected last run to pass but it failed\n' +
                      'Output:\n' + normalizeText(this.lastRun.stdout));
    }
  });

  this.Then(/^the exit status should be ([0-9]+|non-zero)$/, function (code) {
    var actualCode = this.lastRun.error ? this.lastRun.error.code : 0;
    var ok = (code === 'non-zero' && actualCode !== 0) || actualCode === parseInt(code);

    if (!ok) {
      throw new Error('Exit code expected: \'' + code + '\'\n' +
                      'Got: \'' + actualCode + '\'\n' +
                      'Output:\n' + normalizeText(this.lastRun.stdout) + '\n' +
                                    normalizeText(this.lastRun.stderr) + '\n');
    }
  });

  this.Then(/^it outputs this text:$/, function(expectedOutput) {
    var actualOutput = this.lastRun.stdout;

    actualOutput = normalizeText(actualOutput);
    expectedOutput = normalizeText(expectedOutput);

    if (actualOutput !== expectedOutput)
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '\n' +
                      getAdditionalErrorText(this.lastRun));
  });

  this.Then(/^the (error )?output contains the text:$/, function(error, expectedOutput) {
    var actualOutput = error ? this.lastRun.stderr : this.lastRun.stdout;

    actualOutput = normalizeText(actualOutput);
    expectedOutput = normalizeText(expectedOutput);

    if (actualOutput.indexOf(expectedOutput) === -1)
      throw new Error('Expected output to contain the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '\n' +
                      getAdditionalErrorText(this.lastRun));
  });

  this.Then(/^I see the version of Cucumber$/, function() {
    var Cucumber       = require('../../lib/cucumber');
    var actualOutput   = this.lastRun.stdout;
    var expectedOutput = Cucumber.VERSION + '\n';
    if (actualOutput.indexOf(expectedOutput) === -1)
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput);
  });

  this.Then(/^I see the help of Cucumber$/, function() {
    var actualOutput   = this.lastRun.stdout;
    var expectedOutput = 'Usage: cucumber.js ';
    if (actualOutput.indexOf(expectedOutput) === -1)
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput);
  });

  this.Then(/^it suggests a "([^"]*)" step definition snippet(?: with (\d+) parameters?(?: named "([^"]*)")?)? for:$/, function (step, parameterCount, parameterName, regExp) {
    var parameters = [];
    if (parameterName) {
      parameters.push(parameterName);
    }
    else if (parameterCount) {
      var count = parseInt(parameterCount);
      for (var i = 1; i <= count; i ++) {
        parameters.push('arg' + i);
      }
    }
    parameters.push('callback');

    var expectedOutput =
      'this.' + step + '(' + regExp + ', function (' + parameters.join(', ') + ') {\n' +
      '  // Write code here that turns the phrase above into concrete actions\n' +
      '  callback.pending();\n' +
      '});';

    var actualOutput = this.lastRun.stdout;

    actualOutput = normalizeText(actualOutput);
    expectedOutput = normalizeText(expectedOutput);

    if (actualOutput.indexOf(expectedOutput) === -1)
      throw new Error('Expected output to include the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '.\n' +
                      getAdditionalErrorText(this.lastRun));
  });
};

module.exports = cliSteps;

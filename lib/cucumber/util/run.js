var co = require('co');
var isGeneratorFn = require('is-generator').fn;
var realTime = require('./real_time');

function run(fn, thisArg, argsArray, timeoutInMilliseconds, callback) {
  var Cucumber = require('../../cucumber');
  var timeoutId;

  function finish(error, result) {
    Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(finish);
    if (timeoutId) {
      realTime.clearTimeout(timeoutId);
    }
    callback(error, result);
    callback = function() {};
  }

  argsArray.push(finish);

  timeoutId = realTime.setTimeout(function(){
    finish('function timed out after ' + timeoutInMilliseconds + ' milliseconds');
  }, timeoutInMilliseconds);

  Cucumber.Util.Exception.registerUncaughtExceptionHandler(finish);

  var result;
  try {
    if (isGeneratorFn(fn)) {
      result = co.wrap(fn).apply(thisArg, argsArray);
    } else {
      result = fn.apply(thisArg, argsArray);
    }
  } catch (error) {
    return finish(error);
  }

  var callbackInterface = fn.length === argsArray.length;
  var promiseInterface = result && typeof result.then === 'function';
  if (callbackInterface && promiseInterface) {
    finish('function accepts a callback and returns a promise');
  } else if (promiseInterface) {
    result.then(function(result){
      finish(null, result);
    }, function(error) {
      finish(error || 'Promise rejected');
    });
  } else if (!callbackInterface) {
    finish(null, result);
  }
}

module.exports = run;

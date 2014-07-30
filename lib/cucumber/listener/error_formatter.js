module.exports = function(failure) {
  var failureDescription = failure.stack || failure;
  var Configuration = require('../cli/configuration');
  var formatter = Configuration(process.argv).getErrorFormatter();
  
  if (formatter != 'full') {
    return require(formatter)(failure)
  }
  return failureDescription;
}
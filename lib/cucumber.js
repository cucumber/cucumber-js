var Cucumber = function(featuresSource, supportCodeDefinition) {
  return Cucumber.Runtime(featuresSource, supportCodeDefinition);
};
Cucumber.START_MISSING_CALLBACK_ERROR = "Cucumber.start() expects a callback.";
Cucumber.Parser      = require('./cucumber/parser');
Cucumber.Ast         = require('./cucumber/ast');
Cucumber.SupportCode = require('./cucumber/support_code');
Cucumber.Runtime     = require('./cucumber/runtime');
Cucumber.Listener    = require('./cucumber/listener');
Cucumber.Type        = require('./cucumber/type');
Cucumber.Util        = require('./cucumber/util');
Cucumber.Debug       = require('./cucumber/debug'); // Untested namespace
module.exports       = Cucumber;

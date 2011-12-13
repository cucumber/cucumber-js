var Cucumber = function(featureSource, supportCodeInitializer) {
  var configuration = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer);
  var runtime       = Cucumber.Runtime(configuration);
  return runtime;
};
Cucumber.Ast                   = require('./cucumber/ast');
// browserify won't load ./cucumber/cli and throw an exception:
try { Cucumber.Cli             = require('./cucumber/cli'); } catch(e) {}
Cucumber.Debug                 = require('./cucumber/debug'); // Untested namespace
Cucumber.Listener              = require('./cucumber/listener');
Cucumber.Parser                = require('./cucumber/parser');
Cucumber.Runtime               = require('./cucumber/runtime');
Cucumber.SupportCode           = require('./cucumber/support_code');
Cucumber.Type                  = require('./cucumber/type');
Cucumber.Util                  = require('./cucumber/util');
Cucumber.VolatileConfiguration = require('./cucumber/volatile_configuration');

Cucumber.VERSION               = "0.2.3";

module.exports                 = Cucumber;

function Cucumber(featureSource, supportCodeInitializer, options) {
  var configuration = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer, options);
  var runtime       = Cucumber.Runtime(configuration);
  return runtime;
}

Cucumber.Api                   = require('./cucumber/api');
Cucumber.Ast                   = require('./cucumber/ast');
Cucumber.Cli                   = require('./cucumber/cli');
Cucumber.Debug                 = require('./cucumber/debug'); // Untested namespace
Cucumber.Listener              = require('./cucumber/listener');
Cucumber.Parser                = require('./cucumber/parser');
Cucumber.Runtime               = require('./cucumber/runtime');
Cucumber.Status                = require('./cucumber/status');
Cucumber.SupportCode           = require('./cucumber/support_code');
Cucumber.TagGroupParser        = require('./cucumber/tag_group_parser');
Cucumber.Type                  = require('./cucumber/type');
Cucumber.Util                  = require('./cucumber/util');
Cucumber.VolatileConfiguration = require('./cucumber/volatile_configuration');

Cucumber.VERSION               = require('../package.json').version;

module.exports                 = Cucumber;

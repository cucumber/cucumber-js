var Cli = function(argv) {
  var Cucumber = require('../cucumber');

  var self = {
    run: function run(callback) {
      var configuration     = Cli.Configuration(argv);
      var runtime           = Cucumber.Runtime(configuration);
      var progressFormatter = Cucumber.Listener.ProgressFormatter();
      runtime.attachListener(progressFormatter);
      runtime.start(callback);
    }
  };
  return self;
};
Cli.ArgumentParser      = require('./cli/argument_parser');
Cli.Configuration       = require('./cli/configuration');
Cli.FeatureSourceLoader = require('./cli/feature_source_loader');
Cli.SupportCodeLoader   = require('./cli/support_code_loader');
module.exports          = Cli;

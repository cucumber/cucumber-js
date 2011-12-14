var Cli = function(argv) {
  var Cucumber = require('../cucumber');

  var self = {
    run: function run(callback) {
      var configuration = Cli.Configuration(argv);
      if (configuration.isHelpRequested())
        self.displayHelp(callback);
      else if (configuration.isVersionRequested())
        self.displayVersion(callback);
      else
        self.runSuiteWithConfiguration(configuration, callback);
    },

    runSuiteWithConfiguration: function runSuiteWithConfiguration(configuration, callback) {
      var runtime           = Cucumber.Runtime(configuration);
      var progressFormatter = Cucumber.Listener.ProgressFormatter();
      runtime.attachListener(progressFormatter);
      runtime.start(callback);
    },

    displayHelp: function displayHelp(callback) {
      process.stdout.write("Usage: cucumber.js [options] [FILE|DIR]+\n\
\n\
-r, --require LIBRARY|DIR     Require files before executing the features. If\n\
                              this option is not specified, all *.js and\n\
                              *.coffee files that are siblings or below the\n\
                              features will be loaded automatically. Automatic\n\
                              loading is disabled when this option is specified,\n\
                              and all loading becomes explicit.\n\
\n\
                              Files under directories named \"support\" are always\n\
                              loaded first.\n\
\n\
    --version                 Display Cucumber.js's version.\n\
\n\
-h, --help                    You're looking at it.\n");
      callback(true);
    },

    displayVersion: function displayVersion(callback) {
      process.stdout.write(Cucumber.VERSION + "\n");
      callback(true);
    }
  };
  return self;
};
Cli.ArgumentParser      = require('./cli/argument_parser');
Cli.Configuration       = require('./cli/configuration');
Cli.FeatureSourceLoader = require('./cli/feature_source_loader');
Cli.SupportCodeLoader   = require('./cli/support_code_loader');
module.exports          = Cli;

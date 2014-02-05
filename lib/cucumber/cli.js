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
      var runtime   = Cucumber.Runtime(configuration);
      var formatter = configuration.getFormatter();
      runtime.attachListener(formatter);
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
                              Files under directories named \"support\" are\n\
                              always loaded first.\n\
\n\
-t, --tags TAG_EXPRESSION     Only execute the features or scenarios with tags\n\
                              matching TAG_EXPRESSION. Scenarios inherit tags\n\
                              declared on the Feature level. The simplest\n\
                              TAG_EXPRESSION is simply a tag. Example:\n\
                                --tags @dev\n\
\n\
                              When a tag in a tag expression starts with a ~,\n\
                              this represents boolean NOT. Example:\n\
                                --tags ~@dev\n\
\n\
                              A tag expression can have several tags separated\n\
                              by a comma, which represents logical OR. Example:\n\
                                --tags @dev,@wip\n\
\n\
                              The --tags option can be specified several times,\n\
                              and this represents logical AND. Example:\n\
                                --tags @foo,~@bar --tags @zap.\n\
\n\
                              This represents the following boolean expression:\n\
                              (@foo || !@bar) && @zap.\n\
\n\
                              Beware that if you want to use several negative\n\
                              tags to exclude several tags you have to use\n\
                              logical AND: --tags ~@fixme --tags ~@buggy.\n\
\n\
-f, --format FORMAT           How to format features (default: progress).\n\
                              Available formats:\n\
                                pretty  : prints the feature as is\n\
                                progress: prints one character per scenario\n\
                                json    : prints the feature as JSON\n\
                                summary : prints a summary only, after all\n\
                                          scenarios were executed\n\
\n\
--coffee                      Display step definition snippets in CoffeeScript.\n\
\n\
-v, --version                 Display Cucumber.js's version.\n\
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

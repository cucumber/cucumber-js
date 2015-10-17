function Cli(argv) {
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
      var runtime    = Cucumber.Runtime(configuration);
      var formatters = configuration.getFormatters();
      formatters.forEach(function (formatter) {
        runtime.attachListener(formatter);
      });
      runtime.start(callback);
    },

    displayHelp: function displayHelp(callback) {
      /* jshint -W109 */
      process.stdout.write("Usage: cucumber.js [options] [[FILE|DIR][:LINE]]+\n\
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
-f, --format FORMAT[:PATH]    How to format features (default: progress).\n\
                              Supply PATH to redirect that formatters output.\n\
                              Available formats:\n\
                                pretty  : prints the feature as is\n\
                                progress: prints one character per scenario\n\
                                json    : prints the feature as JSON\n\
                                summary : prints a summary only, after all\n\
                                          scenarios were executed\n\
\n\
-p, --profile PROFILE         Pull command line arguments from cucumber.js.\n\
                              When a 'default' profile is defined and no profile\n\
                              is specified it is always used.\n\
\n\
--compiler SUFFIX:MODULE      Include step definitions and support files with the\n\
                              given file suffix and require the given module to\n\
                              load those files.\n\
\n\
-i, --no-snippets             Don't print snippets for pending steps.\n\
\n\
--snippet-syntax FILE         Specify a custom snippet syntax.\n\
\n\
-b, --backtrace               Show full backtrace for all errors.\n\
\n\
-S, --strict                  Fail if there are any undefined or pending steps.\n\
\n\
-d, --dry-run                 Invokes formatters without executing the steps.\n\
\n\
--no-source                   Don't print the source uris.\n\
\n\
--[no-]colors                 Enable/disable colors in output.\n\
\n\
--fail-fast                   Abort the run on first failure.\n\
\n\
-v, --version                 Display Cucumber.js's version.\n\
\n\
-h, --help                    You're looking at it.\n");
      /* jshint +W109 */
      callback(true);
    },

    displayVersion: function displayVersion(callback) {
      process.stdout.write(Cucumber.VERSION + '\n');
      callback(true);
    }
  };
  return self;
}

Cli.ArgumentParser      = require('./cli/argument_parser');
Cli.Configuration       = require('./cli/configuration');
Cli.FeatureSourceLoader = require('./cli/feature_source_loader');
Cli.SupportCodeLoader   = require('./cli/support_code_loader');

module.exports = Cli;

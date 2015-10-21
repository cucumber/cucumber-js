function Cli(argv) {
  var Cucumber = require('../cucumber');
  var Command = require('commander').Command;
  var path = require('path');

  function collect(val, memo) {
    memo.push(val);
    return memo;
  }

  function getConfiguration() {
    var program = getProgram();
    program.parse(argv);
    var profileArgs = Cucumber.Cli.ProfilesLoader.getArgs(program.profile);
    argv.splice.apply(argv, [2, 0].concat(profileArgs));
    program.parse(argv);
    var configuration = Cucumber.Cli.Configuration(program.opts(), program.args);
    return configuration;
  }

  function getProgram () {
    var program = new Command(path.basename(argv[1]));

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(Cucumber.VERSION, '-v, --version')
      .option('-b, --backtrace', 'Show full backtrace for errors')
      .option('--compiler <EXTENSION:MODULE>', 'Require files with the given EXTENSION after requiring MODULE (repeatable)', collect, [])
      .option('-d, --dry-run', 'Invoke formatters without executing steps')
      .option('--fail-fast', 'Abort the run on first failure')
      .option('-f, --format <FORMAT[:PATH]>', 'Specify the output format. Supply PATH to redirect formatter output (repeatable)', collect, ['pretty'])
      .option('--no-colors', 'Disable colors in formatter output')
      .option('--no-snippets', 'Hide step definition snippets for pending steps')
      .option('--no-source', 'Hide source uris')
      .option('-p, --profile <NAME>', 'Specify the profile to use (repeatable)', collect, [])
      .option('-r, --require <FILE|DIR>', 'Require files before executing features (repeatable)', collect, [])
      .option('--snippet-syntax <FILE>', 'Specify a custom snippet syntax')
      .option('-S, --strict', 'Fail if there are any undefined or pending steps')
      .option('-t, --tags <EXPRESSION>', 'Only execute the features or scenarios with tags matching the expression (repeatable)', collect, []);

    return program;
  }

  var self = {
    run: function run(callback) {
      var configuration = getConfiguration();
      var runtime    = Cucumber.Runtime(configuration);
      var formatters = configuration.getFormatters();
      formatters.forEach(function (formatter) {
        runtime.attachListener(formatter);
      });
      runtime.start(callback);
    }
  };
  return self;
}

Cli.Configuration = require('./cli/configuration');
Cli.FeaturePathExpander = require('./cli/feature_path_expander');
Cli.FeatureSourceLoader = require('./cli/feature_source_loader');
Cli.PathExpander = require('./cli/path_expander');
Cli.ProfilesLoader = require('./cli/profiles_loader');
Cli.SupportCodeLoader = require('./cli/support_code_loader');
Cli.SupportCodePathExpander = require('./cli/support_code_path_expander');

module.exports = Cli;

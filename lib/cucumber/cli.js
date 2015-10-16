function Cli(argv) {
  var Cucumber = require('../cucumber');
  var Command = require('commander').Command;
  var path = require('path');
  var _ = require('underscore');

  function collect(val, memo) {
    memo.push(val);
    return memo;
  }

  function getConfiguration() {
    var program = getProgram();
    program.parse(argv);
    var profileArgs = getProfileArgs(program.profile);
    argv.splice.apply(argv, [2, 0].concat(profileArgs));
    program.parse(argv);
    var configuration = Cucumber.Cli.Configuration(program.opts(), program.args);
    return configuration;
  }


  function getProfileArgs(profiles) {
    var profileDefinitions = Cucumber.Cli.ProfileDefinitionLoader.getDefinitions();
    if (profiles.length === 0 && profileDefinitions['default']) {
      profiles = ['default'];
    }
    var profilesArgs = profiles.map(function (profile){
      if (!profileDefinitions[profile]){
        throw new Error('Undefined profile: ' + profile);
      }
      return profileDefinitions[profile].split(/\s/);
    });
    return _.flatten(profilesArgs);
  }

  function getProgram () {
    var program = new Command(path.basename(argv[1]));

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(Cucumber.VERSION, '-v, --version')
      .option('-b, --backtrace', 'Show full backtrace for errors')
      .option('--coffee', 'Display step definition snippets in CoffeeScript')
      .option('--compiler <SUFFIX:MODULE>', 'Require files with the given SUFFIX after requiring MODULE. (repeatable)', collect, [])
      .option('-d, --dry-run', 'Invoke formatters without executing steps')
      .option('--fail-fast', 'Abort the run on first failure')
      .option('-f, --format <FORMAT[:PATH]>', 'Specify the output format. Supply PATH to redirect formatter output (repeatable)', collect, ['pretty'])
      .option('--no-snippets', 'Hide step definition snippets for pending steps')
      .option('--no-source', 'Hide source uris')
      .option('-p, --profile <PROFILE>', 'Specify the profile to use (repeatable)', collect, [])
      .option('-r, --require <FILE|DIR>', 'Require files before executing features (repeatable)', collect, [])
      .option('-S, --strict', 'Fail if there are any undefined or pending steps.')
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
Cli.ProfileDefinitionLoader = require('./cli/profile_definition_loader');
Cli.SupportCodeLoader = require('./cli/support_code_loader');
Cli.SupportCodePathExpander = require('./cli/support_code_path_expander');

module.exports = Cli;

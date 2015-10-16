function Cli(argv) {
  var Cucumber = require('../cucumber');
  var program = require('commander');
  var _ = require('underscore')

  function collect(val, memo) {
    memo.push(val);
    return memo;
  }

  function getProfileArgs(profiles) {
    var profileDefinitions = Cucumber.Cli.ProfileDefinitionLoader.getDefinitions();
    if (typeof(profiles) === 'undefined') {
      if (profileDefinitions['default']) {
        profiles = ['default'];
      } else {
        return args;
      }
    }
    var profilesArgs = profiles.map(function (profile){
      if (!profileDefinitions[profile]){
        throw new Error('Undefined profile: ' + profile);
      }
      return profileDefinitions[profile].split(/\s/);
    });
    return _.flatten(profilesArgs);
  }

  program
    .version(Cucumber.VERSION)
    .usage('[options] [<DIR|FILE[:LINE]>...]')
    .option('-b, --backtrace', 'Show full backtrace for all errors')
    .option('--coffee', 'Display step definition snippets in CoffeeScript')
    .option('--compiler <SUFFIX:MODULE>', 'Require files with the given SUFFIX after requiring MODULE.', collect, [])
    .option('-d, --dry-run', 'Invokes formatters without executing the steps')
    .option('--fail-fast', 'Abort the run on first failure')
    .option('-f, --format <FORMAT[:PATH]>', 'Specify the output format. Supply PATH to redirect that formatters output (repeatable)', collect, [])
    .option('-p, --profile <PROFILE>', 'Specify the profile to use (repeatable)', collect, [])
    .option('-r, --require <FILE|DIR>', 'Require files before executing features (repeatable)', collect, [])
    .option('--snippets', 'Show step definition snippets for pending steps', true)
    .option('--source', 'Show source uris', true)
    .option('-S, --strict', 'Fail if there are any undefined or pending steps.')
    .option('-t, --tags <EXPRESSION>', 'Only execute the features or scenarios with tags matching the expression (repeatable)', collect, []);

  var self = {
    run: function run(callback) {
      program.parse(argv);
      var profileArgs = getProfileArgs(program.profiles);
      program.parse(argv.concat(profileArgs));
      var configuration = Cucumber.Cli.Configuration(program, program.args);
      self.runSuiteWithConfiguration(configuration, callback);
    },

    runSuiteWithConfiguration: function runSuiteWithConfiguration(configuration, callback) {
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

module.exports = Cli;

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function getDefinitions () {
  var definitionFilePath = path.join(process.cwd(), 'cucumber.js');
  if (fs.existsSync(definitionFilePath)) {
    var definitions = require(definitionFilePath);
    if (typeof definitions !== 'object') {
      throw new Error(definitionFilePath + ' does not export an object');
    }
    return definitions;
  } else {
    return {};
  }
}

var ProfilesLoader = {
  getArgs: function getArgs (profiles) {
    var definitions = getDefinitions();
    if (profiles.length === 0 && definitions['default']) {
      profiles = ['default'];
    }
    var profilesArgs = profiles.map(function (profile){
      if (!definitions[profile]){
        throw new Error('Undefined profile: ' + profile);
      }
      return definitions[profile].split(/\s/);
    });
    return _.flatten(profilesArgs);
  }
};

module.exports = ProfilesLoader;

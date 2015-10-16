var fs = require('fs');
var path = require('path');

var ProfileDefinitionLoader = {
  getDefinitions: function getDefinitions() {
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
};

module.exports = ProfileDefinitionLoader;

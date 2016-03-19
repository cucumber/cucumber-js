function ScenarioAtLineRule(suppliedPaths) {
  var Cucumber = require('../../../cucumber');
  var fs = require('fs');
  var _ = require('lodash');

  var mapping = {};
  suppliedPaths.forEach(function(path){
    var matches = Cucumber.Cli.Configuration.FEATURE_FILENAME_AND_LINENUM_REGEXP.exec(path);
    var specifiedLineNums = matches && matches[2];
    if (specifiedLineNums) {
      var realPath = fs.realpathSync(matches[1]);
      if (!mapping[realPath]) {
        mapping[realPath] = [];
      }
      specifiedLineNums.split(':').forEach(function (lineNum) {
        mapping[realPath].push(parseInt(lineNum));
      });
    }
  });

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      if (element.getUri && element.getLines) {
        var lines = mapping[element.getUri()];
        if (lines) {
          return _.some(element.getLines(), function (line) {
            return _.includes(lines, line);
          });
        }
      }
      return true;
    }
  };
  return self;
}

module.exports = ScenarioAtLineRule;

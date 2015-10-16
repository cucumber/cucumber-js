function ScenarioAtLineRule(suppliedPaths) {
  var Cucumber = require('../../../cucumber');
  var fs = require('fs');
  var _ = require('underscore');

  var mapping = {};
  suppliedPaths.forEach(function(path){
    var matches = Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_AND_LINENUM_REGEXP.exec(path);
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
      if (element.getUri && element.getLine) {
        var lines = mapping[element.getUri()];
        if (lines) {
          return _.contains(lines, element.getLine());
        }
        return true;
      }
      return true;
    }
  };
  return self;
}

module.exports = ScenarioAtLineRule;

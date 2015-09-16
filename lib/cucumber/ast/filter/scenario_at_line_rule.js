function ScenarioAtLineRule(suppliedPaths) {
  var Cucumber = require('../../../cucumber');
  var fs = require('fs');
  var _ = require('underscore');

  var mapping = {};
  suppliedPaths.forEach(function(path){
    var matches = Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_AND_LINENUM_REGEXP.exec(path);
    var specifiedLineNum = matches && matches[2];
    if (specifiedLineNum) {
      var realPath = fs.realpathSync(matches[1]);
      if (!mapping[realPath]) {
        mapping[realPath] = [];
      }
      mapping[realPath].push(parseInt(specifiedLineNum));
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

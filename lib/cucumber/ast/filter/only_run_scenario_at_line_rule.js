function ScenarioAtLineRule() {
  var Cucumber = require('../../../cucumber');

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      if (element.getUri && element.getLine) {
        var matches = Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_AND_LINENUM_REGEXP.exec(element.getUri());
        var specifiedLineNum = matches && matches[2];
        if (specifiedLineNum) {
          return parseInt(specifiedLineNum) === element.getLine();
        }
        return true;
      }
      return true;
    }
  };
  return self;
}

module.exports = ScenarioAtLineRule;

function Parser(featureSources, astFilter) {
  var Gherkin      = require('gherkin');
  var Cucumber     = require('../cucumber');

  var parser = new Gherkin.Parser();
  var compiler = new Gherkin.Compiler();

  var self = {
    parse: function parse() {
      var features = [];

      featureSources.forEach(function (featureSource) {
        var uri    = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX];
        var source = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];

        var gherkinDocument;
        try {
          gherkinDocument = parser.parse(source);
        } catch(e) {
          e.message += '\npath: ' + uri;
          throw e;
        }

        var pickles = compiler.compile(gherkinDocument);
        var scenarios = [];
        pickles.forEach(function (pickleData) {
          var scenario = Cucumber.Ast.Scenario(pickleData, uri);
          if (astFilter.isElementEnrolled(scenario)) {
            scenarios.push(scenario);
          }
        });

        if (scenarios.length > 0) {
          features.push(Cucumber.Ast.Feature(gherkinDocument.feature, uri, scenarios));
        }
      });

      return features;
    }
  };
  return self;
}

Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX = 0;
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;

module.exports = Parser;

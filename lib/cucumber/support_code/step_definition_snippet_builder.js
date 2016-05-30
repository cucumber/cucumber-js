var _  = require('lodash');

var NUMBER_PATTERN        = /\d+/gi;
var NUMBER_MATCHING_GROUP = '(\\d+)';

var QUOTED_STRING_PATTERN        = /"[^"]*"/gi;
var QUOTED_STRING_MATCHING_GROUP = '"([^"]*)"';

function StepDefinitionSnippetBuilder(step, syntax) {
  var Cucumber = require('../../cucumber');

  var self = {
    buildSnippet: function buildSnippet() {
      var functionName = self.buildStepDefinitionFunctionName();
      var pattern      = self.buildStepDefinitionPattern();
      var parameters   = self.buildStepDefinitionParameters();
      var comment      = 'Write code here that turns the phrase above into concrete actions';
      return syntax.build(functionName, pattern, parameters, comment);
    },

    buildStepDefinitionFunctionName: function buildStepDefinitionFunctionName() {
      if (step.isOutcomeStep())
        return 'Then';
      else if (step.isEventStep())
        return 'When';
      else
        return 'Given';
    },

    buildStepDefinitionPattern: function buildStepDefinitionPattern() {
      var stepName              = step.getName();
      var escapedStepName       = Cucumber.Util.RegExp.escapeString(stepName);
      var parameterizedStepName = self.parameterizeStepName(escapedStepName);
      var pattern               = '/^' + parameterizedStepName + '$/';
      return pattern;
    },

    buildStepDefinitionParameters: function buildStepDefinitionParameters() {
      var parameters = self.getStepDefinitionPatternMatchingGroupParameters();
      step.getArguments().forEach(function (arg) {
        switch (arg.getType()) {
          case 'DataTable':
            parameters.push('table');
            break;
          case 'DocString':
            parameters.push('string');
            break;
          default:
            throw new Error('Unknown argument type:' + arg.getType());
        }
      });
      parameters.push('callback');
      return parameters;
    },

    getStepDefinitionPatternMatchingGroupParameters: function getStepDefinitionPatternMatchingGroupParameters() {
      var parameterCount = self.countStepDefinitionPatternMatchingGroups();
      var parameters = _.times(parameterCount, function (n) {
        return 'arg' + (n + 1);
      });
      return parameters;
    },

    countStepDefinitionPatternMatchingGroups: function countStepDefinitionPatternMatchingGroups() {
      var stepDefinitionPattern    = self.buildStepDefinitionPattern();
      var numberMatchingGroupCount = Cucumber.Util.String.count(stepDefinitionPattern, NUMBER_MATCHING_GROUP);
      var quotedStringMatchingGroupCount = Cucumber.Util.String.count(stepDefinitionPattern, QUOTED_STRING_MATCHING_GROUP);
      var count = numberMatchingGroupCount + quotedStringMatchingGroupCount;
      return count;
    },

    parameterizeStepName: function parameterizeStepName(stepName) {
      var parameterizedStepName =
          stepName
          .replace(NUMBER_PATTERN, NUMBER_MATCHING_GROUP)
          .replace(QUOTED_STRING_PATTERN, QUOTED_STRING_MATCHING_GROUP);
      return parameterizedStepName;
    }
  };
  return self;
}

StepDefinitionSnippetBuilder.JavaScriptSyntax = require('./step_definition_snippet_builder/javascript_syntax');

module.exports = StepDefinitionSnippetBuilder;

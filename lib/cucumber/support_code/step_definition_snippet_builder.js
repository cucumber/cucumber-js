var _  = require('lodash');
var camelCase = require('camel-case');

var NUMBER_PATTERN        = /\d+/gi;
var NUMBER_MATCHING_GROUP = '(\\d+)';

var QUOTED_STRING_PATTERN        = /"[^"]*"/gi;
var QUOTED_STRING_MATCHING_GROUP = '"([^"]*)"';

var OUTLINE_STRING_PATTERN        = /<[^>]*>/gi;
var OUTLINE_STRING_MATCHING_GROUP = '(.*)';

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
      var stepName              = step.isOutlineStep() ? step.getOriginalStep().getName() : step.getName();
      var escapedStepName       = Cucumber.Util.RegExp.escapeString(stepName);
      var parameterizedStepName = self.parameterizeStepName(escapedStepName);
      var pattern               = '/^' + parameterizedStepName + '$/';
      return pattern;
    },

    buildStepDefinitionParameters: function buildStepDefinitionParameters() {
      var parameters = self.getStepDefinitionPatternMatchingGroupParameters();
      if (step.hasDocString())
        parameters.push('string');
      else if (step.hasDataTable())
        parameters.push('table');
      parameters.push('callback');
      return parameters;
    },

    getStepDefinitionPatternMatchingGroupParameters: function getStepDefinitionPatternMatchingGroupParameters() {
      var parameterCount = self.countStepDefinitionPatternMatchingGroups();
      var parameters = _.times(parameterCount, function (n) {
        return 'arg' + (n + 1);
      });
      var stepName = step.isOutlineStep() ? step.getOriginalStep().getName() : step.getName();
      var outlineMatch = stepName.match(OUTLINE_STRING_PATTERN);
      if (outlineMatch) {
        var outlineParams = outlineMatch.map(function (str) {
          var name = str.substr(1, str.length - 2);
          return camelCase(name);
        });
        parameters = parameters.concat(outlineParams);
      }
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
          .replace(QUOTED_STRING_PATTERN, QUOTED_STRING_MATCHING_GROUP)
          .replace(OUTLINE_STRING_PATTERN, OUTLINE_STRING_MATCHING_GROUP);
      return parameterizedStepName;
    }
  };
  return self;
}

StepDefinitionSnippetBuilder.JavaScriptSyntax = require('./step_definition_snippet_builder/javascript_syntax');

module.exports = StepDefinitionSnippetBuilder;

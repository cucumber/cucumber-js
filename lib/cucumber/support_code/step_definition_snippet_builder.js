var _  = require('underscore');
var stepDefinitionSnippetBuilderSyntax = require('./step_definition_snippet_builder_syntax');
_.str = require('underscore.string');

var StepDefinitionSnippetBuilder = function (step, syntax) {
  var Cucumber = require('../../cucumber');

  var self = {
    buildSnippet: function buildSnippet() {
      var functionName = self.buildStepDefinitionFunctionName();
      var pattern      = self.buildStepDefinitionPattern();
      var parameters   = self.buildStepDefinitionParameters();
      var snippet =
          syntax.getStepDefinitionStart()  +
          functionName                     +
          syntax.getStepDefinitionInner1() +
          pattern                          +
          syntax.getStepDefinitionInner2() +
          parameters                       +
          syntax.getStepDefinitionEnd();
      return snippet;
    },

    buildStepDefinitionFunctionName: function buildStepDefinitionFunctionName() {
      var functionName;
      if (step.isOutcomeStep())
        functionName = syntax.getOutcomeStepDefinitionFunctionName();
      else if (step.isEventStep())
        functionName = syntax.getEventStepDefinitionFunctionName();
      else
        functionName = syntax.getContextStepDefinitionFunctionName();
      return functionName;
    },

    buildStepDefinitionPattern: function buildStepDefinitionPattern() {
      var stepName              = step.isOutlineStep() ? step.getOriginalStep().getName() : step.getName();
      var escapedStepName       = Cucumber.Util.RegExp.escapeString(stepName);
      var parameterizedStepName = self.parameterizeStepName(escapedStepName);
      var pattern               =
          syntax.getPatternStart() +
          parameterizedStepName +
          syntax.getPatternEnd();
      return pattern;
    },

    buildStepDefinitionParameters: function buildStepDefinitionParameters() {
      var parameters = self.getStepDefinitionPatternMatchingGroupParameters();
      if (step.hasDocString())
        parameters = parameters.concat([syntax.getStepDefinitionDocString()]);
      else if (step.hasDataTable())
        parameters = parameters.concat([syntax.getStepDefinitionDataTable()]);
      var parametersAndCallback = parameters.concat([syntax.getStepDefinitionCallback()]);
      var parameterString = parametersAndCallback.join(syntax.getFunctionParameterSeparator());
      return parameterString;
    },

    getStepDefinitionPatternMatchingGroupParameters: function getStepDefinitionPatternMatchingGroupParameters() {
      var parameterCount = self.countStepDefinitionPatternMatchingGroups();
      var parameters = [];
      _(parameterCount).times(function (n) {
        var offset = n + 1;
        parameters.push('arg' + offset);
      });
      var stepName = step.isOutlineStep() ? step.getOriginalStep().getName() : step.getName();
      var outlineParams = stepName.match(StepDefinitionSnippetBuilder.OUTLINE_STRING_PATTERN);
      function cleanParam(param){
        return _.str.camelize(param.substr(1,param.length - 2));
      }
      var cleaned = _.map(outlineParams, cleanParam);
      return parameters.concat(cleaned);
    },

    countStepDefinitionPatternMatchingGroups: function countStepDefinitionPatternMatchingGroups() {
      var stepDefinitionPattern    = self.buildStepDefinitionPattern();
      var numberMatchingGroupCount = Cucumber.Util.String.count(stepDefinitionPattern, syntax.getNumberMatchingGroup());
      var quotedStringMatchingGroupCount = Cucumber.Util.String.count(stepDefinitionPattern, syntax.getQuotedStringMatchingGroup());
      var count = numberMatchingGroupCount + quotedStringMatchingGroupCount;
      return count;
    },

    parameterizeStepName: function parameterizeStepName(stepName) {
      var parameterizedStepName =
          stepName
          .replace(StepDefinitionSnippetBuilder.NUMBER_PATTERN, syntax.getNumberMatchingGroup())
          .replace(StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN, syntax.getQuotedStringMatchingGroup())
          .replace(StepDefinitionSnippetBuilder.OUTLINE_STRING_PATTERN, syntax.getOutlineExampleMatchingGroup());
      return parameterizedStepName;
    }
  };
  return self;
};

StepDefinitionSnippetBuilder.NUMBER_PATTERN         = /\d+/gi;
StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN  = /"[^"]*"/gi;
StepDefinitionSnippetBuilder.OUTLINE_STRING_PATTERN = /<[^>]*>/gi;

module.exports = StepDefinitionSnippetBuilder;

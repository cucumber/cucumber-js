var _  = require('underscore');

var StepDefinitionSnippetBuilder = function(step) {
  var Cucumber = require('../../cucumber');

  var self = {
    buildSnippet: function buildSnippet() {
      var functionName = self.buildStepDefinitionFunctionName();
      var pattern      = self.buildStepDefinitionPattern();
      var parameters   = self.buildStepDefinitionParameters();
      var snippet =
        StepDefinitionSnippetBuilder.STEP_DEFINITION_START  +
        functionName                                        +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER1 +
        pattern                                             +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER2 +
        parameters                                          +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_END;
      return snippet;
    },

    buildStepDefinitionFunctionName: function buildStepDefinitionFunctionName() {
      var functionName;
      if (step.isOutcomeStep())
        functionName = StepDefinitionSnippetBuilder.OUTCOME_STEP_DEFINITION_FUNCTION_NAME;
      else if (step.isEventStep())
        functionName = StepDefinitionSnippetBuilder.EVENT_STEP_DEFINITION_FUNCTION_NAME;
      else
        functionName = StepDefinitionSnippetBuilder.CONTEXT_STEP_DEFINITION_FUNCTION_NAME;
      return functionName;
    },

    buildStepDefinitionPattern: function buildStepDefinitionPattern() {
      var stepName              = step.getName();
      var escapedStepName       = Cucumber.Util.RegExp.escapeString(stepName);
      var parameterizedStepName = self.parameterizeStepName(escapedStepName);
      var pattern               =
        StepDefinitionSnippetBuilder.PATTERN_START +
        parameterizedStepName                      +
        StepDefinitionSnippetBuilder.PATTERN_END
      return pattern;
    },

    buildStepDefinitionParameters: function buildStepDefinitionParameters() {
      var parameters = self.getStepDefinitionPatternMatchingGroupParameters();
      if (step.hasDocString())
        parameters = parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_DOC_STRING]);
      else if (step.hasDataTable())
        parameters = parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_DATA_TABLE]);
      var parametersAndCallback =
        parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_CALLBACK]);
      var parameterString = parametersAndCallback.join(StepDefinitionSnippetBuilder.FUNCTION_PARAMETER_SEPARATOR);
      return parameterString;
    },

    getStepDefinitionPatternMatchingGroupParameters: function getStepDefinitionPatternMatchingGroupParameters() {
      var parameterCount = self.countStepDefinitionPatternMatchingGroups();
      var parameters = [];
      _(parameterCount).times(function(n) {
        var offset = n + 1;
        parameters.push('arg' + offset);
      });
      return parameters;
    },

    countStepDefinitionPatternMatchingGroups: function countStepDefinitionPatternMatchingGroups() {
      var stepDefinitionPattern    = self.buildStepDefinitionPattern();
      var numberMatchingGroupCount =
        Cucumber.Util.String.count(stepDefinitionPattern, StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP);
      var quotedStringMatchingGroupCount =
        Cucumber.Util.String.count(stepDefinitionPattern, StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP);
      var count = numberMatchingGroupCount + quotedStringMatchingGroupCount;
      return count;
    },

    parameterizeStepName: function parameterizeStepName(stepName) {
      var parameterizedStepName =
        stepName
        .replace(StepDefinitionSnippetBuilder.NUMBER_PATTERN, StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP)
        .replace(StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN, StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP);
      return parameterizedStepName;
    }
  };
  return self;
};

StepDefinitionSnippetBuilder.STEP_DEFINITION_START                 = 'this.';
StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER1                = '(';
StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER2                = ', function(';
StepDefinitionSnippetBuilder.STEP_DEFINITION_END                   = ") {\n  // express the regexp above with the code you wish you had\n  callback.pending();\n});\n";
StepDefinitionSnippetBuilder.STEP_DEFINITION_DOC_STRING            = 'string';
StepDefinitionSnippetBuilder.STEP_DEFINITION_DATA_TABLE            = 'table';
StepDefinitionSnippetBuilder.STEP_DEFINITION_CALLBACK              = 'callback';
StepDefinitionSnippetBuilder.PATTERN_START                         = '/^';
StepDefinitionSnippetBuilder.PATTERN_END                           = '$/';
StepDefinitionSnippetBuilder.CONTEXT_STEP_DEFINITION_FUNCTION_NAME = 'Given';
StepDefinitionSnippetBuilder.EVENT_STEP_DEFINITION_FUNCTION_NAME   = 'When';
StepDefinitionSnippetBuilder.OUTCOME_STEP_DEFINITION_FUNCTION_NAME = 'Then';
StepDefinitionSnippetBuilder.NUMBER_PATTERN                        = /\d+/gi;
StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP                 = '(\\d+)';
StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN                 = /"[^"]*"/gi;
StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP          = '"([^"]*)"';
StepDefinitionSnippetBuilder.FUNCTION_PARAMETER_SEPARATOR          = ', ';
module.exports = StepDefinitionSnippetBuilder;

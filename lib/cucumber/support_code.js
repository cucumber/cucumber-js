if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    './support_code/hook',
    './support_code/library',
    './support_code/step_definition',
    './support_code/step_definition_snippet_builder',
    './support_code/world_constructor'
], function(Hook, Library, StepDefinition, StepDefinitionSnippetBuilder, WorldConstructor) {
var SupportCode                          = {};
SupportCode.Hook                         = Hook;
SupportCode.Library                      = Library;
SupportCode.StepDefinition               = StepDefinition;
SupportCode.StepDefinitionSnippetBuilder = StepDefinitionSnippetBuilder;
SupportCode.WorldConstructor             = WorldConstructor;
return SupportCode;
});

function SnippetsFormatter(options) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Listener.Formatter(options);
  var snippets = [];

  self.handleStepResultEvent = function handleStepResult(stepResult) {
    var status = stepResult.getStatus();
    if (status === Cucumber.Status.UNDEFINED) {
      var step = stepResult.getStep();
      var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, options.snippetSyntax);
      snippets.push(snippetBuilder.buildSnippet());
    }
  };

  self.handleFeaturesResultEvent = function handleFeaturesResultEvent(featuresResult, callback) {
    self.log(snippets.join('\n\n'));
    self.finish(callback);
  };

  return self;
}

module.exports = SnippetsFormatter;

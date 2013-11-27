var JsonFormatter = function(options) {
  var Cucumber             = require('../../cucumber');
  var GherkinJsonFormatter = require('gherkin/lib/gherkin/formatter/json_formatter');

  var currentFeatureId     = 'undefined';
  var self                 = Cucumber.Listener.Formatter(options);

  var formatterIo = {
    write: function(string){
      self.log(string);
    }
  };
  var gherkinJsonFormatter =  new GherkinJsonFormatter(formatterIo);

  var parentFeatureTags;

  self.getGherkinFormatter = function() {
    return gherkinJsonFormatter;
  }

  self.formatStep = function formatStep(step) {
    var stepProperties = {
      name:    step.getName(),
      line:    step.getLine(),
      keyword: step.getKeyword()
    };
    if (step.hasDocString()) {
      var docString = step.getDocString();
      stepProperties['doc_string'] = {
        value:        docString.getContents(),
        line:         docString.getLine(),
        content_type: docString.getContentType()
      };
    }
    if (step.hasDataTable()) {
      var tableContents   = step.getDataTable().getContents();
      var raw             = tableContents.raw();
      var tableProperties = [];
      raw.forEach(function (rawRow) {
        var row = {line: undefined, cells: rawRow};
        tableProperties.push(row);
      });
      stepProperties['rows'] = tableProperties;
    }
    gherkinJsonFormatter.step(stepProperties);
  }

  self.formatTags = function formatTags(tags, parentTags) {
    var tagsProperties = [];
    tags.forEach(function (tag) {
      var isParentTag = false;
      if (parentTags) {
        parentTags.forEach(function (parentTag) {
          if ((tag.getName() == parentTag.getName()) && (tag.getLine() == parentTag.getLine())) {
            isParentTag = true;
          }
        });
      }
      if (!isParentTag) {
        tagsProperties.push({name: tag.getName(), line: tag.getLine()});
      }
    });
    return tagsProperties;
  }

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature      = event.getPayloadItem('feature');
    currentFeatureId = feature.getName().replace(' ', '-'); // FIXME: wrong abstraction level, this should be encapsulated "somewhere"

    var featureProperties = {
      id:          currentFeatureId,
      name:        feature.getName(),
      description: feature.getDescription(),
      line:        feature.getLine(),
      keyword:     feature.getKeyword()
    };

    var tags = feature.getTags();
    if (tags.length > 0) {
      formattedTags = self.formatTags(tags, []);
      featureProperties['tags'] = formattedTags;
    }

    gherkinJsonFormatter.uri(feature.getUri());
    gherkinJsonFormatter.feature(featureProperties);
    parentFeatureTags = tags;
    callback();
  }

  self.handleBackgroundEvent = function handleBackgroundEvent(event, callback) {
    var background = event.getPayloadItem('background');
    gherkinJsonFormatter.background({name: background.getName(), keyword: "Background", description: background.getDescription(), type: 'background', line: background.getLine()})
    var steps = background.getSteps();
    steps.forEach(function(value, index, ar) { self.formatStep(value); });
    callback();
  }

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {

    var scenario = event.getPayloadItem('scenario');

    var id = currentFeatureId + ';' + scenario.getName().replace(/ /g, '-').toLowerCase();
    var scenarioProperties = {name: scenario.getName(), id: id, line: scenario.getLine(), keyword: 'Scenario',  description: scenario.getDescription(), type: 'scenario'};

    var tags = scenario.getTags();
    if (tags.length > 0) {
      var formattedTags = self.formatTags(tags, parentFeatureTags);
      if (formattedTags.length > 0) {
        scenarioProperties['tags'] = formattedTags;
      }
    }
    gherkinJsonFormatter.scenario(scenarioProperties);
    callback();
  }

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');

    var step = stepResult.getStep();
    self.formatStep(step);

    var stepOutput = {};
    var resultStatus = 'failed';

    if (stepResult.isSuccessful()) {
      resultStatus = 'passed';
      stepOutput['duration'] = stepResult.getDuration();
    }
    else if (stepResult.isPending()) {
      resultStatus = 'pending';
      stepOutput['error_message'] = undefined;
    }
    else if (stepResult.isSkipped()) {
      resultStatus = 'skipped';
    }
    else if (stepResult.isUndefined()) {
      resultStatus = 'undefined';
    }
    else {
      var failureMessage = stepResult.getFailureException();
      if (failureMessage) {
        stepOutput['error_message'] = (failureMessage.stack || failureMessage);
      }
      stepOutput['duration'] = stepResult.getDuration();
    }

    stepOutput['status'] = resultStatus;
    gherkinJsonFormatter.result(stepOutput);
    gherkinJsonFormatter.match({location: undefined});
    callback();
  }

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    gherkinJsonFormatter.eof();
    gherkinJsonFormatter.done();
    callback();
  }

  return self;
};

module.exports = JsonFormatter;


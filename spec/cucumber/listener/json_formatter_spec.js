/* jshint -W106 */
require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var fs = require('fs');
  var jsonFormatter, options;

  beforeEach(function () {
    options = {};
    var formatter = createSpyWithStubs("formatter", {finish: null, log: null});
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    jsonFormatter = Cucumber.Listener.JsonFormatter(options);
  });

  describe("no features", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");
    });

    it("calls finish with the callback", function () {
      jsonFormatter.handleAfterFeaturesEvent({}, callback);
      expect(jsonFormatter.finish).toHaveBeenCalledWith(callback);
    });
  });

  describe("one feature", function() {
    beforeEach(function () {
      var tag1 = createSpyWithStubs('tag1', {getName: 'tag 1', getLine: 1});
      var tag2 = createSpyWithStubs('tag2', {getName: 'tag 2', getLine: 1});
      var feature = createSpyWithStubs("feature", {
        getKeyword: 'Feature',
        getName: 'A Feature Name',
        getDescription: 'A Feature Description',
        getLine: 2,
        getUri: 'uri',
        getTags: [tag1, tag2]
      });
      jsonFormatter.handleBeforeFeatureEvent(feature);
    });

    describe("with no scenarios", function () {
      beforeEach(function () {
        jsonFormatter.handleAfterFeaturesEvent({});
      });

      it("outputs the feature", function () {
        expect(jsonFormatter.log).toHaveBeenCalled();
        var json = jsonFormatter.log.calls.mostRecent().args[0];
        var features = JSON.parse(json);
        expect(features).toEqual([{
          description: 'A Feature Description',
          elements: [],
          id: 'a-feature-name',
          keyword: 'Feature',
          line: 2,
          name: 'A Feature Name',
          tags: [
            {name: 'tag 1', line: 1},
            {name: 'tag 2', line: 1},
          ],
          uri: 'uri'
        }]);
      });
    });

    describe("with a scenario", function () {
      beforeEach(function () {
        var tag1 = createSpyWithStubs('tag1', {getName: 'tag 1', getLine: 3});
        var tag2 = createSpyWithStubs('tag2', {getName: 'tag 2', getLine: 3});
        var scenario = createSpyWithStubs("scenario", {
          getKeyword: 'Scenario',
          getName: 'A Scenario Name',
          getDescription: 'A Scenario Description',
          getLine: 4,
          getTags: [tag1, tag2]
        });
        jsonFormatter.handleBeforeScenarioEvent(scenario);
      });

      describe("with no steps", function () {
        beforeEach(function () {
          jsonFormatter.handleAfterFeaturesEvent({});
        });

        it("outputs the feature and the scenario", function () {
          expect(jsonFormatter.log).toHaveBeenCalled();
          var json = jsonFormatter.log.calls.mostRecent().args[0];
          var features = JSON.parse(json);
          expect(features[0].elements).toEqual([{
            description: 'A Scenario Description',
            id: 'a-feature-name;a-scenario-name',
            keyword: 'Scenario',
            line: 4,
            name: 'A Scenario Name',
            steps: [],
            tags: [
              {name: 'tag 1', line: 3},
              {name: 'tag 2', line: 3}
            ],
            type: 'scenario'
          }]);
        });
      });

      describe("with a step", function () {
        var step, stepResult;

        beforeEach(function() {
          step = createSpyWithStubs("step", {
            getArguments: [],
            getLine: 1,
            getKeyword: 'Step',
            getName: 'A Step Name',
            isHidden: false
          });

          stepResult = createSpyWithStubs("stepResult", {
            getDuration: 1,
            getFailureException: null,
            getStatus: Cucumber.Status.PASSED,
            getStep: step,
            getStepDefinition: null,
            hasAttachments: false,
            getAttachments: []
          });
        });

        describe("that is passing", function () {
          beforeEach(function() {
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps).toEqual([{
              arguments: [],
              line: 1,
              keyword: 'Step',
              name: 'A Step Name',
              result: {
                status: 'passed',
                duration: 1
              }
            }]);
          });
        });

        describe("that is failing", function () {
          beforeEach(function() {
            stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
            stepResult.getFailureException.and.returnValue({stack: 'failure stack'});
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].result).toEqual({
              status: 'failed',
              error_message: 'failure stack',
              duration: 1
            });
          });
        });

        describe("that is hidden", function () {
          beforeEach(function() {
            step.isHidden.and.returnValue(true);
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("does not output a line attribute and outputs a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].hasOwnProperty('line')).toEqual(false);
            expect(features[0].elements[0].steps[0].hidden).toEqual(true);
          });
        });

        describe("with a doc string", function () {
          beforeEach(function (){
            var docString = createSpyWithStubs("docString", {
              getContent: "This is a DocString",
              getLine: 2,
              getContentType: null,
              getType: 'DocString'
            });
            step.getArguments.and.returnValue([docString]);
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].arguments).toEqual([{
              line: 2,
              content: 'This is a DocString',
              contentType: null
            }]);
          });
        });

        describe("with a data table", function () {
          beforeEach(function (){
            var dataTable = createSpyWithStubs("dataTable", {
              getType: 'DataTable',
              raw: [
                ['a:1', 'a:2', 'a:3'],
                ['b:1', 'b:2', 'b:3'],
                ['c:1', 'c:2', 'c:3']
              ]
            });
            step.getArguments.and.returnValue([dataTable]);
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].arguments).toEqual([{
              rows: [
                {cells: ['a:1', 'a:2', 'a:3'] },
                {cells: ['b:1', 'b:2', 'b:3'] },
                {cells: ['c:1', 'c:2', 'c:3'] }
              ]
            }]);
          });
        });

        describe("with attachments", function () {
          beforeEach(function (){
            var attachment1 = createSpyWithStubs("first attachment", {getMimeType: "first mime type", getData: "first data"});
            var attachment2 = createSpyWithStubs("second attachment", {getMimeType: "second mime type", getData: "second data"});
            var favicon = fs.readFileSync('example/images/favicon.png');
            var attachment3 = createSpyWithStubs("third attachment", {
              getMimeType: "image/png",
              getData: favicon
            });
            this.faviconBase64 = favicon.toString('base64');
            var attachments = [attachment1, attachment2, attachment3];
            stepResult.hasAttachments.and.returnValue(true);
            stepResult.getAttachments.and.returnValue(attachments);
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a hidden attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].embeddings).toEqual([
              {data: 'Zmlyc3QgZGF0YQ==', mime_type: 'first mime type'},
              {data: 'c2Vjb25kIGRhdGE=', mime_type: 'second mime type'},
              {
                data: this.faviconBase64,
                mime_type: 'image/png'
              }
            ]);
          });
        });

        describe("with a step definition", function () {
          beforeEach(function (){
            var stepDefinition = createSpyWithStubs('step definition', {
              getLine: 2,
              getUri: 'path/to/stepDef'
            });
            stepResult.getStepDefinition.and.returnValue(stepDefinition);
            jsonFormatter.handleStepResultEvent(stepResult);
            jsonFormatter.handleAfterFeaturesEvent({});
          });

          it("outputs the step with a match attribute", function () {
            expect(jsonFormatter.log).toHaveBeenCalled();
            var json = jsonFormatter.log.calls.mostRecent().args[0];
            var features = JSON.parse(json);
            expect(features[0].elements[0].steps[0].match).toEqual({
              location: 'path/to/stepDef:2'
            });
          });
        });
      });
    });
  });
});

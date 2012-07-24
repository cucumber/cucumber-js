require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatterWrapper", function() {
  var Cucumber = requireLib('cucumber');
  var listener, failedStepResults;

  var fakeFormatter = createSpyObj('formatter', ['step', 'uri', 'feature', 'background', 'scenario', 'result', 'match', 'eof', 'done']);

  beforeEach(function() {
    listener = Cucumber.Listener.JsonFormatterWrapper(fakeFormatter);
  });

  // Handle Feature

  describe("handleBeforeFeatureEvent()", function() {
    var event, feature, callback;

    beforeEach(function() {
      feature = createSpyWithStubs("feature", 
                                   {getKeyword: 'Feature',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getUri: 'TODO',
                                    getTags: false});

      event    = createSpyWithStubs("event", {getPayloadItem: feature});

      callback = createSpy("callback");
    });

    it("adds the feature attributes to the output", function() {
      listener.handleBeforeFeatureEvent(event, callback);     
      expect(fakeFormatter.uri).toHaveBeenCalledWith('TODO');
      expect(fakeFormatter.feature).toHaveBeenCalledWith({id: 'A-Name', 
                                                           name: 'A Name', 
                                                           description: 'A Description', 
                                                           line: 3, 
                                                           keyword: 'Feature'});

    });

  });

  // Handle Background

  describe("handleBackgroundEvent()", function() {

    var parent_feature_event, background, step, steps, event, callback;

    beforeEach(function() {
      feature = createSpyWithStubs("feature", 
                                   {getKeyword: 'Feature',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getUri: 'feature-uri',
                                    getTags: false});

      parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false,
        hasDataTable: false        
      });

      steps = [step];

      background = createSpyWithStubs("background", 
                                   {getKeyword: 'Background',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getSteps: steps});

      event    = createSpyWithStubs("event", {getPayloadItem: background});
      callback = createSpy("callback");
    });

    it("adds the background attributes to the output", function() {
      listener.handleBackgroundEvent(event, callback);
      expect(fakeFormatter.background).toHaveBeenCalledWith({name: 'A Name', 
                                                             keyword: 'Background', 
                                                             description: 'A Description', 
                                                             type: 'background', 
                                                             line: 3 });
    });

  });

  // Handle Scenario

  describe("handleBeforeScenarioEvent()", function() {
    var parent_feature_event, scenario, callback;

    beforeEach(function() {
      feature = createSpyWithStubs("feature", 
                                   {getKeyword: 'Feature',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getUri: 'feature-uri',
                                    getTags: false});

      parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      scenario = createSpyWithStubs("scenario", 
                                   {getKeyword: 'Scenario',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getTags: false});

      event    = createSpyWithStubs("event", {getPayloadItem: scenario});
      callback = createSpy("callback");
    });

    it("adds the scenario attributes to the output", function() {
      listener.handleBeforeScenarioEvent(event, callback);
      expect(fakeFormatter.scenario).toHaveBeenCalledWith({name: 'A Name', 
                                                           id: 'undefined;a-name', 
                                                           line: 3, 
                                                           keyword: 'Scenario', 
                                                           description: 'A Description', 
                                                           type: 'scenario' });
    });

  });

  // Step Formatting

  describe("formatStep()", function() {

    it("adds name, line and keyword to the step properties", function(){

      var step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false,
        hasDataTable: false        
      });

      listener.formatStep(step);
      expect(fakeFormatter.step).toHaveBeenCalledWith({ name : 'Step', line : 3, keyword : 'Step'});

    });

    it("if the step has one, adds a DocString to the step properties", function(){

      var fakeDocString = createSpyWithStubs("docString", {
        getContents: "This is a DocString",
        getLine: 3,
        getContentType: null});

      var step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: true,
        hasDataTable: false,
        getDocString: fakeDocString        
      });

      listener.formatStep(step);
      expect(fakeFormatter.step).toHaveBeenCalledWith({name: 'Step', 
                                                       line: 3, 
                                                       keyword: 'Step', 
                                                       doc_string: {value: 'This is a DocString', line: 3, content_type: null} 
                                                      });

    });

    it("if the step has one, adds a DataTable to the step properties", function(){

      var fakeContents = createSpyWithStubs("row", {
        raw: [['a:1', 'a:2', 'a:3'],['b:1', 'b:2', 'b:3'],['c:1', 'c:2', 'c:3']]
      })

      var fakeDataTable = createSpyWithStubs("dataTable", {
        getContents: fakeContents
      });

      var step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false,
        hasDataTable: true,
        getDataTable: fakeDataTable        
      });

      listener.formatStep(step);
      expect(fakeFormatter.step).toHaveBeenCalledWith({name: 'Step', 
                                                       line: 3, 
                                                       keyword: 'Step', 
                                                       rows: [{line : 'TODO', cells: ['a:1', 'a:2', 'a:3'] }, 
                                                              {line : 'TODO', cells: ['b:1', 'b:2', 'b:3'] }, 
                                                              {line : 'TODO', cells: ['c:1', 'c:2', 'c:3'] }] 
                                                      });
    });

  });

  // Tag Formatting

  describe("formatTags()", function() {

    it("returns the given tags in the format expected by the JSON formatter", function(){

      var tags = [createSpyWithStubs("tag", {getName: "tag_one", getLine:1}), 
                  createSpyWithStubs("tag", {getName: "tag_two", getLine:2}),
                  createSpyWithStubs("tag", {getName: "tag_three", getLine:3})];

      expect(listener.formatTags(tags, null)).toEqual([{name: 'tag_one', line :1},
                                                       {name: 'tag_two', line :2},
                                                       {name: 'tag_three', line :3}]);

    });

    it("filters out any tags it is told to ignore - e.g. those of the parent feature", function(){

      var tags = [createSpyWithStubs("tag", {getName: "tag_one", getLine:1}), 
                  createSpyWithStubs("tag", {getName: "tag_two", getLine:2}),
                  createSpyWithStubs("tag", {getName: "parent_one", getLine:3}),
                  createSpyWithStubs("tag", {getName: "parent_two", getLine:3})];

      var parent_tags = [createSpyWithStubs("tag", {getName: "parent_one", getLine:3}),
                         createSpyWithStubs("tag", {getName: "parent_two", getLine:3})];


      expect(listener.formatTags(tags, parent_tags)).toEqual([{name: 'tag_one', line :1},
                                                              {name: 'tag_two', line :2}]);
    });

  });

  // Handle Step Results

  describe("handleStepResultEvent()", function() {
    var parent_feature_event, feature, parent_scenario_event, scenario, event, callback, stepResult;

    beforeEach(function() {
      callback   = createSpy("Callback");
    });

    it("outputs a step with failed status where no result has been defined", function(){

      step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false,
        hasDataTable: false        
      });

      stepResult = createSpyWithStubs("stepResult", {
        isSuccessful: undefined,
        isPending:    undefined,
        isFailed:     undefined,
        isSkipped:    undefined,
        isUndefined:  undefined,
        getFailureException: false,
        getStep:      step 
      });

      fakeEvent      = createSpyWithStubs("event", {getPayloadItem: stepResult});

      listener.handleStepResultEvent(fakeEvent, callback);

      expect(fakeFormatter.step).toHaveBeenCalledWith({name: 'Step', line: 3, keyword: 'Step'});
      expect(fakeFormatter.result).toHaveBeenCalledWith({status: 'failed'});
      expect(fakeFormatter.match).toHaveBeenCalledWith({location: 'TODO'});

    });

  });

  // We're all done. Output the JSON.

  describe("handleAfterFeaturesEvent()", function() {
    var features, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      
    });

    it("finalises output", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(fakeFormatter.eof).toHaveBeenCalled();
      expect(fakeFormatter.done).toHaveBeenCalled();
    });

    it("calls back", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

});


require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatterWrapper", function() {
  var Cucumber = requireLib('cucumber');
  var listener, failedStepResults;
  var buffer = new Buffer(1024); 

  beforeEach(function() {
    buffer.fill(0);
    listener = Cucumber.Listener.JsonFormatterWrapper(buffer);
  });

  describe("constructor", function() {
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
                                    getUri: 'TODO'});

      event    = createSpyWithStubs("event", {getPayloadItem: feature});

      callback = createSpy("callback");
    });

    it("adds the feature attributes to the output", function() {
      listener.handleBeforeFeatureEvent(event, callback);
      listener.handleAfterFeaturesEvent(event, callback); 
     
      var output = buffer.toString();
      output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

      var expectedOutput = '[ { "id": "A-Name", \
                                "name": "A Name", \
                                "description": "A Description", \
                                "line": 3, \
                                "keyword": "Feature", \
                                "uri": "TODO" } ]';

      var expectedJson = JSON.parse(expectedOutput);
      var expectedJsonString = JSON.stringify(expectedJson, null, 2);
      var actualJson = JSON.parse(output);
      var actualJsonString = JSON.stringify(actualJson, null, 2);

      expect(actualJsonString).toEqual(expectedJsonString);

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
                                    getUri: 'feature-uri'});

      parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false        
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
      listener.handleBeforeFeatureEvent(parent_feature_event, callback);
      listener.handleBackgroundEvent(event, callback);
      listener.handleAfterFeaturesEvent(parent_feature_event, callback); 
      var output = buffer.toString();
      output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

      var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","keyword":"Background","description":"A Description","type":"background","line":3,"steps":[{"name":"Step","line":3,"keyword":"Step"}]}]}]';

      expect(output).toEqual(expected);

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
                                    getUri: 'feature-uri'});

      parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      scenario = createSpyWithStubs("scenario", 
                                   {getKeyword: 'Scenario',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3});

      event    = createSpyWithStubs("event", {getPayloadItem: scenario});
      callback = createSpy("callback");
    });

    it("adds the scenario attributes to the output", function() {
      listener.handleBeforeFeatureEvent(parent_feature_event, callback);
      listener.handleBeforeScenarioEvent(event, callback);
      listener.handleAfterFeaturesEvent(parent_feature_event, callback); 
      var output = buffer.toString();
      output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

      var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","id":"A-Name;a-name","line":3,"keyword":"Scenario","description":"A Description","type":"scenario"}]}]';

      expect(output).toEqual(expected);

    });

  });

  // Handle Step Results

  describe("handleStepResultEvent()", function() {
    var parent_feature_event, feature, parent_scenario_event, scenario, event, callback, stepResult;

    beforeEach(function() {
      feature = createSpyWithStubs("feature", 
                                   {getKeyword: 'Feature',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getUri: 'feature-uri'});

      parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      scenario = createSpyWithStubs("scenario", 
                                   {getKeyword: 'Scenario',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3});

      parent_scenario_event    = createSpyWithStubs("event", {getPayloadItem: scenario});

      step = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false        
      });

      stepResult = createSpyWithStubs("step result", {
        isSuccessful: undefined,
        isPending:    undefined,
        isFailed:     undefined,
        isSkipped:    undefined,
        isUndefined:  undefined,
        getStep:      step 
      });

      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
    });


    it("adds the step result to the parent scenario in the output", function(){
      stepResult.isSuccessful.andReturn(true);
      listener.handleBeforeFeatureEvent(parent_feature_event, callback);
      listener.handleBeforeScenarioEvent(parent_scenario_event, callback);
      listener.handleStepResultEvent(event, callback);
      listener.handleAfterFeaturesEvent(parent_feature_event, callback); 

      var output = buffer.toString();
      output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

      var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","id":"A-Name;a-name","line":3,"keyword":"Scenario","description":"A Description","type":"scenario","steps":[{"name":"Step","line":3,"keyword":"Step","result":{"status":"passed"},"match":{"location":"TODO"}}]}]}]';

      expect(output).toEqual(expected);

    });

  });

  // We're all done.  Output the JSON.

  describe("handleAfterFeaturesEvent()", function() {
    var features, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      
    });

    // TODO: What else should we test here?  e.g. calls made to the formatter?

    it("calls back", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

});


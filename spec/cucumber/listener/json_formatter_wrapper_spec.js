require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatterWrapper", function() {
  var Cucumber = requireLib('cucumber');
  var listener, failedStepResults;

  describe("constructor", function() {
    // TODO!
  });


  // Handle Feature

  // describe("handleBeforeFeatureEvent()", function() {
  //   var event, feature, callback;

  //   beforeEach(function() {
  //     feature = createSpyWithStubs("feature", 
  //                                  {getKeyword: 'Feature',
  //                                   getName: 'A Name',
  //                                   getDescription: 'A Description',
  //                                   getLine: 3,
  //                                   getUri: 'TODO',
  //                                   getTags: false});

  //     event    = createSpyWithStubs("event", {getPayloadItem: feature});

  //     callback = createSpy("callback");
  //   });

  //   it("adds the feature attributes to the output", function() {
  //     listener.handleBeforeFeatureEvent(event, callback);
  //     listener.handleAfterFeaturesEvent(event, callback); 
     
  //     var output = buffer.toString();
  //     output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

  //     var expectedOutput = '[ { "id": "A-Name", \
  //                               "name": "A Name", \
  //                               "description": "A Description", \
  //                               "line": 3, \
  //                               "keyword": "Feature", \
  //                               "uri": "TODO" } ]';

  //     var expectedJson = JSON.parse(expectedOutput);
  //     var expectedJsonString = JSON.stringify(expectedJson, null, 2);
  //     var actualJson = JSON.parse(output);
  //     var actualJsonString = JSON.stringify(actualJson, null, 2);

  //     expect(actualJsonString).toEqual(expectedJsonString);

  //   });

  // });

  // Handle Background

//   describe("handleBackgroundEvent()", function() {

//     var parent_feature_event, background, step, steps, event, callback;

//     beforeEach(function() {
//       feature = createSpyWithStubs("feature", 
//                                    {getKeyword: 'Feature',
//                                     getName: 'A Name',
//                                     getDescription: 'A Description',
//                                     getLine: 3,
//                                     getUri: 'feature-uri',
//                                     getTags: false});

//       parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

//       step = createSpyWithStubs("step", {
//         getName: 'Step',
//         getLine: 3,
//         getKeyword: 'Step',
//         hasDocString: false,
//         hasDataTable: false        
//       });

//       steps = [step];

//       background = createSpyWithStubs("background", 
//                                    {getKeyword: 'Background',
//                                     getName: 'A Name',
//                                     getDescription: 'A Description',
//                                     getLine: 3,
//                                     getSteps: steps});

//       event    = createSpyWithStubs("event", {getPayloadItem: background});
//       callback = createSpy("callback");
//     });

//     it("adds the background attributes to the output", function() {
//       listener.handleBeforeFeatureEvent(parent_feature_event, callback);
//       listener.handleBackgroundEvent(event, callback);
//       listener.handleAfterFeaturesEvent(parent_feature_event, callback); 
//       var output = buffer.toString();
//       output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

//       var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","keyword":"Background","description":"A Description","type":"background","line":3,"steps":[{"name":"Step","line":3,"keyword":"Step"}]}]}]';

//       expect(output).toEqual(expected);

//     });

// });

  // Handle Scenario

  // describe("handleBeforeScenarioEvent()", function() {
  //   var parent_feature_event, scenario, callback;

  //   beforeEach(function() {
  //     feature = createSpyWithStubs("feature", 
  //                                  {getKeyword: 'Feature',
  //                                   getName: 'A Name',
  //                                   getDescription: 'A Description',
  //                                   getLine: 3,
  //                                   getUri: 'feature-uri',
  //                                   getTags: false});

  //     parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

  //     scenario = createSpyWithStubs("scenario", 
  //                                  {getKeyword: 'Scenario',
  //                                   getName: 'A Name',
  //                                   getDescription: 'A Description',
  //                                   getLine: 3,
  //                                   getTags: false});

  //     event    = createSpyWithStubs("event", {getPayloadItem: scenario});
  //     callback = createSpy("callback");
  //   });

  //   it("adds the scenario attributes to the output", function() {
  //     listener.handleBeforeFeatureEvent(parent_feature_event, callback);
  //     listener.handleBeforeScenarioEvent(event, callback);
  //     listener.handleAfterFeaturesEvent(parent_feature_event, callback); 
  //     var output = buffer.toString();
  //     output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

  //     var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","id":"A-Name;a-name","line":3,"keyword":"Scenario","description":"A Description","type":"scenario"}]}]';

  //     expect(output).toEqual(expected);

  //   });

  // });

  // Step Formatting

  describe("formatStep()", function() {

    var fakeFormatter = createSpyObj('formatter', ['step']);

    beforeEach(function() {
      listener = Cucumber.Listener.JsonFormatterWrapper(fakeFormatter);
    });

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
      expect(fakeFormatter.step).toHaveBeenCalledWith({ name : 'Step', line : 3, keyword : 'Step', doc_string : { value : 'This is a DocString', line : 3, content_type : null } });

    });

    it("if the step has one, adds a DataTable to the step properties", function(){

      var fakeContents = createSpyWithStubs("row", {
        raw: "RAW DATA"
      })

      var fakeDataTable = createSpyWithStubs("dataTable", {
        getContents: fakeContents
      });

      var stepTwo = createSpyWithStubs("step", {
        getName: 'Step',
        getLine: 3,
        getKeyword: 'Step',
        hasDocString: false,
        hasDataTable: true,
        getDataTable: fakeDataTable        
      });

      listener.formatStep(stepTwo);
      // expect(fakeFormatter.step).toHaveBeenCalledWith("FOO");
    });

  });

  describe("formatTags()", function() {
    it("returns the given tags in the format expected by the JSON formatter", function(){
    });

    it("filters out any tags it is told to ignore - e.g. those of the parent feature", function(){
    });

  });

  // Handle Step Results

  // describe("handleStepResultEvent()", function() {
  //   var parent_feature_event, feature, parent_scenario_event, scenario, event, callback, stepResult;

  //   beforeEach(function() {
  //     feature = createSpyWithStubs("feature", 
  //                                  {getKeyword: 'Feature',
  //                                   getName: 'A Name',
  //                                   getDescription: 'A Description',
  //                                   getLine: 3,
  //                                   getUri: 'feature-uri',
  //                                   getTags: false});

  //     parent_feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

  //     scenario = createSpyWithStubs("scenario", 
  //                                  {getKeyword: 'Scenario',
  //                                   getName: 'A Name',
  //                                   getDescription: 'A Description',
  //                                   getLine: 3,
  //                                   getTags: false});

  //     parent_scenario_event    = createSpyWithStubs("event", {getPayloadItem: scenario});

  //     step = createSpyWithStubs("step", {
  //       getName: 'Step',
  //       getLine: 3,
  //       getKeyword: 'Step',
  //       hasDocString: false,
  //       hasDataTable: false        
  //     });

  //     stepResult = createSpyWithStubs("step result", {
  //       isSuccessful: undefined,
  //       isPending:    undefined,
  //       isFailed:     undefined,
  //       isSkipped:    undefined,
  //       isUndefined:  undefined,
  //       getStep:      step 
  //     });

  //     event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
  //     callback   = createSpy("Callback");
  //   });


  //   it("adds the step result to the parent scenario in the output", function(){
  //     stepResult.isSuccessful.andReturn(true);
  //     listener.handleBeforeFeatureEvent(parent_feature_event, callback);
  //     listener.handleBeforeScenarioEvent(parent_scenario_event, callback);
  //     listener.handleStepResultEvent(event, callback);
  //     listener.handleAfterFeaturesEvent(parent_feature_event, callback); 

  //     var output = buffer.toString();
  //     output = output.substr(0,output.indexOf(String.fromCharCode(0))); 

  //     var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"name":"A Name","id":"A-Name;a-name","line":3,"keyword":"Scenario","description":"A Description","type":"scenario","steps":[{"name":"Step","line":3,"keyword":"Step","result":{"status":"passed"},"match":{"location":"TODO"}}]}]}]';

  //     expect(output).toEqual(expected);

  //   });

  // });

  // // We're all done. Output the JSON.

  // describe("handleAfterFeaturesEvent()", function() {
  //   var features, callback;

  //   beforeEach(function() {
  //     event    = createSpy("Event");
  //     callback = createSpy("Callback");
      
  //   });

  //   // TODO: What else should we test here?  e.g. calls made to the formatter?

  //   it("calls back", function() {
  //     listener.handleAfterFeaturesEvent(event, callback);
  //     expect(callback).toHaveBeenCalled();
  //   });

  // });

});


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

  // Get Event
/*
  describe("hear()", function() {
    var event, callback;
    var eventHandler;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(listener, 'hasHandlerForEvent');
      spyOn(listener, 'getHandlerForEvent');
    });

    it("checks wether there is a handler for the event", function() {
      listener.hear(event, callback);
      expect(listener.hasHandlerForEvent).toHaveBeenCalledWith(event);
    });

    describe("when there is a handler for that event", function() {
      beforeEach(function() {
        eventHandler = createSpy("Event handler (function)");
        listener.hasHandlerForEvent.andReturn(true);
        listener.getHandlerForEvent.andReturn(eventHandler);
      });

      it("gets the handler for that event", function() {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).toHaveBeenCalledWith(event);
      });

      it("calls the handler with the event and the callback", function() {
        listener.hear(event, callback);
        expect(eventHandler).toHaveBeenCalledWith(event, callback);
      });

      it("does not callback", function() {
        listener.hear(event, callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when there are no handlers for that event", function() {
      beforeEach(function() {
        listener.hasHandlerForEvent.andReturn(false);
      });

      it("calls back", function() {
        listener.hear(event, callback);
        expect(callback).toHaveBeenCalled();
      });

      it("does not get the handler for the event", function() {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe("hasHandlerForEvent", function() {
    var event, eventHandlerName, eventHandler;

    beforeEach(function() {
      event            = createSpy("Event");
      eventHandlerName = createSpy("event handler name");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("builds the name of the handler for that event", function() {
      listener.hasHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when the handler exists", function() {
      beforeEach(function() {
        eventHandler = createSpy("event handler");
        listener[eventHandlerName] = eventHandler;
      });

      it("returns true", function() {
        expect(listener.hasHandlerForEvent(event)).toBeTruthy();
      });
    });

    describe("when the handler does not exist", function() {
      it("returns false", function() {
        expect(listener.hasHandlerForEvent(event)).toBeFalsy();
      });
    });
  });

  describe("buildHandlerNameForEvent", function() {
    var event, eventName;

    beforeEach(function() {
      eventName = "SomeEventName";
      event     = createSpyWithStubs("Event", {getName: eventName});
    });

    it("gets the name of the event", function() {
      listener.buildHandlerNameForEvent(event);
      expect(event.getName).toHaveBeenCalled();
    });

    it("returns the name of the event with prefix 'handle' and suffix 'Event'", function() {
      expect(listener.buildHandlerNameForEvent(event)).toBe("handle" + eventName + "Event");
    });
  });

  describe("getHandlerForEvent()", function() {
    var event;
    var eventHandlerName, eventHandler;

    beforeEach(function() {
      event            = createSpy("event");
      eventHandlerName = 'handleSomeEvent';
      eventHandler     = createSpy("event handler");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("gets the name of the handler for the event", function() {
      listener.getHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when an event handler exists for the event", function() {
      beforeEach(function() {
        listener[eventHandlerName] = eventHandler;
      });

      it("returns the event handler", function() {
        expect(listener.getHandlerForEvent(event)).toBe(eventHandler);
      });
    });

    describe("when no event handlers exist for the event", function() {
      it("returns nothing", function() {
        expect(listener.getHandlerForEvent(event)).toBeUndefined();
      });
    });
  });
*/
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

      var expected = '[{"id":"A-Name","name":"A Name","description":"A Description","line":3,"keyword":"Feature","uri":"feature-uri","elements":[{"keyword":"Scenario","name":"A Name","description":"A Description","line":3,"id":"A-Name;a-name"}]}]';

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
        getKeyword: 'Step'        
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

      var expected = '[]';

      expect(output).toEqual(expected);

    });

  });

/*
    it("adds the step result to parent when there are multiple features in the output", function(){

      stepResult.isSuccessful.andReturn(true);

      feature = createSpyWithStubs("feature", 
                                   {getKeyword: 'Feature',
                                    getName: 'A Name',
                                    getDescription: 'A Description',
                                    getLine: 3,
                                    getUri: 'TODO'});

      feature_event    = createSpyWithStubs("event", {getPayloadItem: feature});

      listener.handleBeforeFeatureEvent(feature_event, callback);
      listener.handleStepResultEvent(event, callback);

      listener.handleBeforeFeatureEvent(feature_event, callback);
      listener.handleStepResultEvent(event, callback);

      listener.handleBeforeFeatureEvent(feature_event, callback);
      listener.handleStepResultEvent(event, callback);

    });


    it("gets the step result from the event payload", function() {
    });

    it("checks wether the step was successful or not", function() {
    });

    describe("when the step passed", function() {
    });

    describe("when the step did not pass", function() {
      beforeEach(function() {
      });

      it("does not handle a successful step result", function() {
      });

      it("checks wether the step is pending", function() {
      });

      describe("when the step was pending", function() {
        beforeEach(function() {
        });

        it("handles the pending step result", function() {
        });
      });

      describe("when the step was not pending", function() {
        beforeEach(function() {
        });

        it("does not handle a pending step result", function() {
        });

        it("checks wether the step was skipped", function() {
        });

        describe("when the step was skipped", function() {
          beforeEach(function() {
          });

          it("handles the skipped step result", function() {
          });
        });

        describe("when the step was not skipped", function() {
          beforeEach(function() {
          });

          it("does not handle a skipped step result", function() {
          });

          it("checks wether the step was undefined", function() {
          });

          describe("when the step was undefined", function() {
            beforeEach(function() {
            });

            it("handles the undefined step result", function() {
            });
          });

          describe("when the step was not undefined", function() {
            beforeEach(function() {
            });

            it("does not handle a skipped step result", function() {
            });

            it("handles a failed step result", function() {
            });
          });
        });
      });
    });

    it("calls back", function() {
    });
   
  });
*/
  // We're all done.  Output the JSON.

  describe("handleAfterFeaturesEvent()", function() {
    var features, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      
    });

    it("writes to stdout", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      // expect(process.stdout.write).toHaveBeenCalled(); //TODO: With anything?
    });

    it("calls back", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

});


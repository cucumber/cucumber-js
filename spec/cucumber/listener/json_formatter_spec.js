require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatter", function() {
  var Cucumber = requireLib('cucumber');
  var listener, failedStepResults;

  beforeEach(function() {
    listener = Cucumber.Listener.JsonFormatter();
  });

  describe("constructor", function() {
  });

  // Get Event

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

  // Handle Feature

  describe("handleBeforeFeatureEvent()", function() {
    var scenario, event, callback;

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
      var output = listener.getOutput(); 
      var expectedOutput = '[ { "id": "A-Name", \
                                "name": "A Name", \
                                "description": "A Description", \
                                "line": 3, \
                                "keyword": "Feature", \
                                "uri": "TODO" } ]';

      var expectedJson = JSON.parse(expectedOutput);
      var expectedJsonString = JSON.stringify(expectedJson, null, 2);
      var actualJsonString = JSON.stringify(output, null, 2);

      expect(actualJsonString).toEqual(expectedJsonString);

    });

    it("it keeps track of the current feature so we can add scenarios and steps to it", function() {
      listener.handleBeforeFeatureEvent(event, callback);
      expect(listener.getCurrentFeatureIndex()).toEqual(0);
      listener.handleBeforeFeatureEvent(event, callback);
      expect(listener.getCurrentFeatureIndex()).toEqual(1);
      listener.handleBeforeFeatureEvent(event, callback);
      expect(listener.getCurrentFeatureIndex()).toEqual(2);
    });

  });

  // Handle Scenario

  describe("handleBeforeScenarioEvent()", function() {

  });

  // Handle Step Results

  describe("handleStepResultEvent()", function() {
    var event, callback, stepResult;

    beforeEach(function() {

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
      listener.handleStepResultEvent(event, callback);
      output = listener.getOutput();

      var expectedOutput = '[ \
                            { \
                              "elements": [ \
                                { \
                                  "steps": [ \
                                    { \
                                      "name": "Step", \
                                      "line": 3, \
                                      "keyword": "Step", \
                                      "result": { \
                                        "status": "passed" \
                                      }, \
                                      "match": { \
                                        "location": "TODO" \
                                      } \
                                    } \
                                  ] \
                                } \
                              ] \
                            } \
                          ]';

      var expectedJson = JSON.parse(expectedOutput);
      var actualJsonString = JSON.stringify(output, null, 2);
      var expectedJsonString = JSON.stringify(expectedJson, null, 2);

      expect(actualJsonString).toEqual(expectedJsonString);

    });

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

      // console.log(listener.getOutput());
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

  // We're all done.  Output the JSON.

  describe("handleAfterFeaturesEvent()", function() {
    var features, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
    });

    it("writes to stdout", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(process.stdout.write).toHaveBeenCalled(); //TODO: With anything?
    });

    it("calls back", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

});


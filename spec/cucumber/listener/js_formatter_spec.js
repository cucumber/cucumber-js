
require('../../support/spec_helper');

describe("Cucumber.Listener.JSFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, jsFormatter, options;

  beforeEach(function () {
    options             = createSpy(options);
    formatter           = createSpyWithStubs("formatter", {log: null});
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    jsFormatter = Cucumber.Listener.JSFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(jsFormatter).toBe(formatter);
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, stepResult;

    beforeEach(function () {
      step = createSpy();
      stepResult = createSpyWithStubs("step result", {getStep: step);
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(jsFormatter, 'buildStep');
      spyOn(jsFormatter, 'addStep');
    });

    it("gets the step result from the event payload", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("gets the step from the step result", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("builds the JSON step", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(jsFormatter.buildStep).toHaveBeenCalledWith(stepResult, step);
    });

    it("adds the new step to the result", function () {
      newStep = createSpy();
      jsFormatter.buildStep.andReturn(newStep);
      jsFormatter.handleStepResultEvent(event, callback);
      expect(jsFormatter.addStem).toHaveBeenCalledWith(newStep);
    });

    it("calls back", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

});

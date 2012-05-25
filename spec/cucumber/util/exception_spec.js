require('../../support/spec_helper');

describe("Cucumber.Util.Arguments", function() {
  var UNCAUGHT_EXCEPTION_EVENT = 'uncaughtException';

  var Cucumber = requireLib('cucumber');

  describe(".registerUncaughtExceptionHandler()", function () {
    var exceptionHandler;

    describe("in a Node.js environment", function() {
      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        spyOn(process, 'on');
      });

      it("registers the exception handler to the process's 'uncaughtException' event", function () {
        Cucumber.Util.Exception.registerUncaughtExceptionHandler(exceptionHandler);
        expect(process.on).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EVENT, exceptionHandler);
      });
    });

    describe("in a browser environment", function() {
      var previousOn;

      beforeEach(function () {
        previousOn = process.on;
        process.on = void(0);
        exceptionHandler = createSpy("exception handler");
        global.window = createSpy("window");
      });

      afterEach(function () {
        process.on = previousOn;
      });

      it("registers the exception handler to the windows's 'onerror' event handler", function () {
        Cucumber.Util.Exception.registerUncaughtExceptionHandler(exceptionHandler);
        expect(window.onerror).toBe(exceptionHandler);
      });
    });
  });

  describe(".unregisterUncaughtExceptionHandler()", function () {
    var exceptionHandler;

    describe("in a Node.js environment", function() {
      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        spyOn(process, 'removeListener');
      });

      it("registers the exception handler to the process's 'uncaughtException' event", function () {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(exceptionHandler);
        expect(process.removeListener).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EVENT, exceptionHandler);
      });
    });

    describe("in a browser environment", function() {
      var previousRemoveListener;

      beforeEach(function () {
        previousRemoveListener = process.removeListener;
        process.removeListener = void(0);
        exceptionHandler = createSpy("exception handler");
        global.window = createSpyWithStubs("window", {onerror: exceptionHandler});
      });

      afterEach(function () {
        process.removeListener = previousRemoveListener;
      });

      it("registers the exception handler to the windows's 'onerror' event handler", function () {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(exceptionHandler);
        expect(window.onerror).toBeUndefined();
      });
    });
  });
});

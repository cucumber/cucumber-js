/* jshint -W117 */
require('../../support/spec_helper');

describe("Cucumber.Util.Arguments", function () {
  var DOMAIN_ERROR_EVENT = 'error';
  var UNCAUGHT_EXCEPTION_EVENT = 'uncaughtException';

  var Cucumber = requireLib('cucumber');

  describe(".registerUncaughtExceptionHandler()", function () {
    var exceptionHandler, stepDomain;

    beforeEach(function () {
      stepDomain = createSpy('step domain');
    });

    describe("with a full-blown domain", function () {

      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        spyOnStub(stepDomain, 'on');
        spyOnStub(stepDomain, 'enter');
      });

      it("registers the exception handler to the domain's 'error' event", function () {
        Cucumber.Util.Exception.registerUncaughtExceptionHandler(exceptionHandler, stepDomain);
        expect(stepDomain.on).toHaveBeenCalledWith(DOMAIN_ERROR_EVENT, exceptionHandler);
      });
    });

    describe("without a complete domain (might be browserified domain)", function () {
      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        // no spy on stepDomain.enter/stepDomain.exit
        spyOn(process, 'on');
      });

      it("registers the exception handler to the process's 'uncaughtException' event", function () {
        Cucumber.Util.Exception.registerUncaughtExceptionHandler(exceptionHandler, stepDomain);
        expect(process.on).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EVENT, exceptionHandler);
      });
    });

    describe("in a browser environment", function () {
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
    var exceptionHandler, stepDomain;

    beforeEach(function () {
      stepDomain = createSpy('step domain');
    });

    describe("with a full-blown domain", function () {

      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        spyOnStub(stepDomain, 'removeListener');
        spyOnStub(stepDomain, 'exit');
      });

      it("unregisters the exception handler to the domain's 'error' event", function () {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(exceptionHandler, stepDomain);
        expect(stepDomain.removeListener).toHaveBeenCalledWith(DOMAIN_ERROR_EVENT, exceptionHandler);
      });
    });

    describe("without a full-blown domain", function () {
      beforeEach(function () {
        exceptionHandler = createSpy("exception handler");
        spyOn(process, 'removeListener');
      });

      it("registers the exception handler to the process's 'uncaughtException' event", function () {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(exceptionHandler, stepDomain);
        expect(process.removeListener).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EVENT, exceptionHandler);
      });
    });

    describe("in a browser environment", function () {
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

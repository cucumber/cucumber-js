require('../../support/spec_helper');

describe("Cucumber.Listener.Formatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, listener;

  beforeEach(function () {
    var Formatter = Cucumber.Listener.Formatter;
    listener = createSpy("listener");
    spyOn(Cucumber, 'Listener').andReturn(listener);
    Cucumber.Listener.Formatter = Formatter;
    formatter = Cucumber.Listener.Formatter();
  });

  describe("constructor", function () {
    it("creates a listener", function () {
      expect(Cucumber.Listener).toHaveBeenCalled();
    });

    it("extends the formatter", function () {
      expect(formatter).toBe(listener);
    });
  });

  describe("log()", function () {
    var logged, alsoLogged, loggedBuffer;

    beforeEach(function () {
      logged       = "this was logged";
      alsoLogged   = "this was also logged";
      loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write');
    });

    it("records logged strings", function () {
      formatter.log(logged);
      formatter.log(alsoLogged);
      expect(formatter.getLogs()).toBe(loggedBuffer);
    });

    it("outputs the logged string to STDOUT by default", function () {
        formatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
    });

    describe("when asked to output to STDOUT", function () {
      beforeEach(function () {
        formatter = Cucumber.Listener.Formatter({logToConsole: true});
      });

      it("outputs the logged string to STDOUT", function () {
        formatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to not output to STDOUT", function () {
      beforeEach(function () {
        formatter = Cucumber.Listener.Formatter({logToConsole: false});
      });

      it("does not output anything to STDOUT", function () {
        formatter.log(logged);
        expect(process.stdout.write).not.toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to output to a function", function () {
      var userFunction;

      beforeEach(function () {
        userFunction      = createSpy("output user function");
        formatter = Cucumber.Listener.Formatter({logToFunction: userFunction});
      });

      it("calls the function with the logged string", function () {
        formatter.log(logged);
        expect(userFunction).toHaveBeenCalledWith(logged);
      });
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      formatter.log(logged);
      formatter.log(alsoLogged);
      expect(formatter.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(formatter.getLogs()).toBe("");
    });
  });
});

require('../support/spec_helper');

describe("Cucumber.Cli", function() {
  var Cucumber = requireLib('cucumber');

  var cli, argv;

  beforeEach(function() {
    argv = createSpy("process argv array");
    cli  = Cucumber.Cli(argv);
  });

  describe("run()", function() {
    var configuration, callback;

    beforeEach(function() {
      configuration = createSpyWithStubs("CLI configuration", {isVersionRequested: null});
      callback      = createSpy("callback");
      spyOn(Cucumber.Cli, 'Configuration').andReturn(configuration);
      spyOn(cli, 'runSuiteWithConfiguration');
    });

    it("creates a new CLI configuration", function() {
      cli.run(callback);
      expect(Cucumber.Cli.Configuration).toHaveBeenCalledWith(argv);
    });

    it("checks wether the version is requested or not", function() {
      cli.run(callback);
      expect(configuration.isVersionRequested).toHaveBeenCalled();
    });

    describe("when the version is requested", function() {
      beforeEach(function() {
        configuration.isVersionRequested.andReturn(true);
        spyOn(cli, 'displayVersion');
      });

      it("displays the version", function() {
        cli.run(callback);
        expect(cli.displayVersion).toHaveBeenCalledWith(callback);
      });

      it("does not run the suite", function() {
        cli.run(callback);
        expect(cli.runSuiteWithConfiguration).not.toHaveBeenCalled();
      });
    });

    describe("when the version is not requested", function() {
      beforeEach(function() {
        configuration.isVersionRequested.andReturn(false);
      });

      it("runs the suite", function() {
        cli.run(callback);
        expect(cli.runSuiteWithConfiguration).toHaveBeenCalledWith(configuration, callback);
      });
    });
  });

  describe("runSuiteWithConfiguration()", function() {
    var configuration, runtime, callback;
    var progressFormatter;

    beforeEach(function() {
      configuration = createSpy("CLI configuration");
      runtime       = createSpyWithStubs("runtime", {start: null, attachListener: null});
      callback      = createSpy("callback");
      spyOn(Cucumber, 'Runtime').andReturn(runtime);
      spyOn(Cucumber.Listener, 'ProgressFormatter').andReturn(progressFormatter);
    });

    it("creates a Cucumber runtime with the CLI configuration", function() {
      cli.runSuiteWithConfiguration(configuration, callback);
      expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
    });

    it("creates a new progress formatter", function() {
      cli.runSuiteWithConfiguration(configuration, callback);
      expect(Cucumber.Listener.ProgressFormatter).toHaveBeenCalled();
    });

    it("attaches the progress formatter to the runtime", function() {
      cli.runSuiteWithConfiguration(configuration, callback);
      expect(runtime.attachListener).toHaveBeenCalledWith(progressFormatter);
    });

    it("runs the runtime with the callback", function() {
      cli.runSuiteWithConfiguration(configuration, callback);
      expect(runtime.start).toHaveBeenCalledWith(callback);
    });
  });

  describe("displayVersion()", function() {
    var callback;

    beforeEach(function() {
      callback = createSpy("callback");
      spyOn(process.stdout, 'write');
    });

    it("outputs the version of Cucumber to STDOUT", function() {
      cli.displayVersion(callback);
      expect(process.stdout.write).toHaveBeenCalledWith(Cucumber.VERSION + "\n");
    });

    it("calls back and tells it succeeded", function() {
      cli.displayVersion(callback);
      expect(callback).toHaveBeenCalledWith(true);
    });
  });
});

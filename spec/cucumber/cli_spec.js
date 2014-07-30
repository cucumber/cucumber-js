require('../support/spec_helper');

describe("Cucumber.Cli", function () {
  var Cucumber = requireLib('cucumber');

  var cli, argv;

  beforeEach(function () {
    argv = createSpy("process argv array");
    cli  = Cucumber.Cli(argv);
  });

  describe("run()", function () {
    var configuration, callback;

    beforeEach(function () {
      configuration = createSpyWithStubs("CLI configuration", {isVersionRequested: false, isHelpRequested: false});
      callback      = createSpy("callback");
      spyOn(Cucumber.Cli, 'Configuration').andReturn(configuration);
      spyOn(cli, 'displayHelp');
      spyOn(cli, 'displayVersion');
      spyOn(cli, 'runSuiteWithConfiguration');
    });

    it("creates a new CLI configuration", function () {
      cli.run(callback);
      expect(Cucumber.Cli.Configuration).toHaveBeenCalledWith(argv);
    });

    it("checks whether the help is requested or not", function () {
      cli.run(callback);
      expect(configuration.isHelpRequested).toHaveBeenCalled();
    });

    describe("when the help is requested", function () {
      beforeEach(function () {
        configuration.isHelpRequested.andReturn(true);
        cli.run(callback);
      });

      it("displays the help", function () {
        expect(cli.displayHelp).toHaveBeenCalledWith(callback);
      });

      it("does not run the suite", function () {
        expect(cli.runSuiteWithConfiguration).not.toHaveBeenCalledWith(callback);
      });

      it("does not display the version", function () {
        expect(cli.displayVersion).not.toHaveBeenCalledWith(callback);
      });
    });

    describe("when the help is not requested", function () {
      it("checks whether the version is requested or not", function () {
        configuration.isHelpRequested.andReturn(false);
        cli.run(callback);
        expect(configuration.isVersionRequested).toHaveBeenCalled();
      });

      describe("when the version is requested", function () {
        beforeEach(function () {
          configuration.isVersionRequested.andReturn(true);
          cli.run(callback);
        });

        it("displays the version", function () {
          expect(cli.displayVersion).toHaveBeenCalledWith(callback);
        });

        it("does not display the help", function () {
          expect(cli.displayHelp).not.toHaveBeenCalled();
        });

        it("does not run the suite", function() {
          expect(cli.runSuiteWithConfiguration).not.toHaveBeenCalled();
        });
      });

      describe("when the version is not requested", function () {
        beforeEach(function () {
          configuration.isVersionRequested.andReturn(false);
          cli.run(callback);
        });

        it("runs the suite", function () {
          expect(cli.runSuiteWithConfiguration).toHaveBeenCalledWith(configuration, callback);
        });

        it("does not display the help", function () {
          cli.run(callback);
          expect(cli.displayHelp).not.toHaveBeenCalled();
        });

        it("runs the suite", function() {
          expect(cli.runSuiteWithConfiguration).toHaveBeenCalledWith(configuration, callback);
        });

        it("does not display the help", function() {
          expect(cli.displayHelp).not.toHaveBeenCalled();
        });

        it("does not display the version", function() {
          expect(cli.displayVersion).not.toHaveBeenCalledWith(callback);
        });
      });
    });
  });

  describe("runSuiteWithConfiguration()", function () {
    var configuration, runtime, callback;
    var formatter;

    beforeEach(function () {
      formatter     = createSpy("formatter");
      configuration = createSpyWithStubs("CLI configuration", {getFormatter: formatter});
      runtime       = createSpyWithStubs("runtime", {start: null, attachListener: null});
      callback      = createSpy("callback");
      spyOn(Cucumber, 'Runtime').andReturn(runtime);
      cli.runSuiteWithConfiguration(configuration, callback);
    });

    it("creates a Cucumber runtime with the CLI configuration", function() {
      expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
    });

    it("gets the formatter from the configuration", function() {
      expect(configuration.getFormatter).toHaveBeenCalled();
    });

    it("attaches the formatter to the runtime", function() {
      expect(runtime.attachListener).toHaveBeenCalledWith(formatter);
    });

    it("runs the runtime with the callback", function() {
      expect(runtime.start).toHaveBeenCalledWith(callback);
    });
  });

  describe("displayVersion()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");
      spyOn(process.stdout, 'write');
      cli.displayVersion(callback);
    });

    it("outputs the version of Cucumber to STDOUT", function() {
      expect(process.stdout.write).toHaveBeenCalledWith(Cucumber.VERSION + "\n");
    });

    it("calls back and tells it succeeded", function() {
      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  describe("displayHelp()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");
      spyOn(process.stdout, 'write');
      cli.displayHelp(callback);
    });

    it("outputs the usage of Cucumber to STDOUT", function() {
      expect(process.stdout.write).toHaveBeenCalledWithStringMatching("Usage: cucumber.js ");
    });

    it("calls back and tells it succeeded", function() {
      expect(callback).toHaveBeenCalledWith(true);
    });
  });
});

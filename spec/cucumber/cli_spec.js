require('../support/spec_helper');

describe("Cucumber.Cli", function() {
  var Cucumber = require('cucumber');

  var cli, argv;

  beforeEach(function() {
    argv = createSpy("process argv array");
    cli  = Cucumber.Cli(argv);
  });

  describe("run()", function() {
    var configuration, runtime, callback;
    var progressFormatter;

    beforeEach(function() {
      configuration = createSpy("CLI configuration");
      runtime       = createSpyWithStubs("runtime", {start: null, attachListener: null});
      callback      = createSpy("callback");
      spyOn(Cucumber.Cli, 'Configuration').andReturn(configuration);
      spyOn(Cucumber, 'Runtime').andReturn(runtime);
      spyOn(Cucumber.Listener, 'ProgressFormatter').andReturn(progressFormatter);
    });

    it("creates a new CLI configuration", function() {
      cli.run(callback);
      expect(Cucumber.Cli.Configuration).toHaveBeenCalledWith(argv);
    });

    it("creates a Cucumber runtime with the CLI configuration", function() {
      cli.run(callback);
      expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
    });

    it("creates a new progress formatter", function() {
      cli.run(callback);
      expect(Cucumber.Listener.ProgressFormatter).toHaveBeenCalled();
    });

    it("attaches the progress formatter to the runtime", function() {
      cli.run(callback);
      expect(runtime.attachListener).toHaveBeenCalledWith(progressFormatter);
    });

    it("runs the runtime with the callback", function() {
      cli.run(callback);
      expect(runtime.start).toHaveBeenCalledWith(callback);
    });
  });
});

require('./support/spec_helper');

describe("Cucumber", function () {
  var Cucumber = requireLib('cucumber');

  var featureSource, supportCodeInitializer, options, configuration, runtime;

  beforeEach(function () {
    featureSource          = createSpy("feature source");
    supportCodeInitializer = createSpy("support code initialize");
    options                = createSpy("other options");
    configuration          = createSpy("volatile configuration");
    runtime                = createSpy("Cucumber runtime");
    spyOn(Cucumber, 'VolatileConfiguration').and.returnValue(configuration);
    spyOn(Cucumber, 'Runtime').and.returnValue(runtime);
  });

  it("creates a volatile configuration with the feature source and support code definition", function () {
    new Cucumber(featureSource, supportCodeInitializer, options);
    expect(Cucumber.VolatileConfiguration).toHaveBeenCalledWith(featureSource, supportCodeInitializer, options);
  });

  it("creates a Cucumber runtime with the configuration", function () {
    new Cucumber(featureSource, supportCodeInitializer, options);
    expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
  });

  it("returns the Cucumber runtime", function () {
    var cucumber = new Cucumber(featureSource, supportCodeInitializer, options);
    expect(cucumber).toBe(runtime);
  });
});

require('./support/spec_helper');

describe("Cucumber", function() {
  var Cucumber = requireLib('cucumber');

  var featureSource, supportCodeInitializer, options, configuration;

  beforeEach(function() {
    featureSource          = createSpy("feature source");
    supportCodeInitializer = createSpy("support code initialize");
    options                = createSpy("other options");
    configuration          = createSpy("volatile configuration");
    runtime                = createSpy("Cucumber runtime");
    spyOn(Cucumber, 'VolatileConfiguration').andReturn(configuration);
    spyOn(Cucumber, 'Runtime').andReturn(runtime);
  });

  it("creates a volatile configuration with the feature source and support code definition", function() {
    Cucumber(featureSource, supportCodeInitializer, options);
    expect(Cucumber.VolatileConfiguration).toHaveBeenCalledWith(featureSource, supportCodeInitializer, options);
  });

  it("creates a Cucumber runtime with the configuration", function() {
    Cucumber(featureSource, supportCodeInitializer, options);
    expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
  });

  it("returns the Cucumber runtime", function() {
    expect(Cucumber(featureSource, supportCodeInitializer, options)).toBe(runtime);
  });
});

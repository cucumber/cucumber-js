require('./support/spec_helper');

describe("Cucumber", function() {
  var Cucumber = require('cucumber');

  var featureSource, supportCodeInitializer, configuration;

  beforeEach(function() {
    featureSource          = createSpy("feature source");
    supportCodeInitializer = createSpy("support code initialize");
    configuration          = createSpy("volatile configuration");
    runtime                = createSpy("Cucumber runtime");
    spyOn(Cucumber, 'VolatileConfiguration').andReturn(configuration);
    spyOn(Cucumber, 'Runtime').andReturn(runtime);
  });

  it("creates a volatile configuration with the feature source and support code definition", function() {
    Cucumber(featureSource, supportCodeInitializer);
    expect(Cucumber.VolatileConfiguration).toHaveBeenCalledWith(featureSource, supportCodeInitializer);
  });

  it("creates a Cucumber runtime with the configuration", function() {
    Cucumber(featureSource, supportCodeInitializer);
    expect(Cucumber.Runtime).toHaveBeenCalledWith(configuration);
  });

  it("returns the Cucumber runtime", function() {
    expect(Cucumber(featureSource, supportCodeInitializer)).toBe(runtime);
  });
});

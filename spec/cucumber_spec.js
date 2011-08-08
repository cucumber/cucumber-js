require('./support/spec_helper');

describe("Cucumber", function() {
  var Cucumber = require('cucumber');

  var featuresSource, supportCodeDefinition, runtime;

  beforeEach(function() {
    featuresSource        = createSpy("features source");
    supportCodeDefinition = createSpy("support code definition");
    runtime               = createSpy("runtime");
    spyOn(Cucumber, 'Runtime').andReturn(runtime);
  });

  it("creates a runtime with the featuresSource and supportCodeDefinition", function() {
    Cucumber(featuresSource, supportCodeDefinition);
    expect(Cucumber.Runtime).toHaveBeenCalledWith(featuresSource, supportCodeDefinition);
  });

  it("returns the runtime", function() {
    var cucumber = Cucumber(featuresSource, supportCodeDefinition);
    expect(cucumber).toBe(runtime);
  });
});

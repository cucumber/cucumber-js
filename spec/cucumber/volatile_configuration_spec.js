require('../support/spec_helper');
require('../support/configurations_shared_examples.js');

describe("Cucumber.VolatileConfiguration", function() {
  var Cucumber = require('cucumber');

  var featureSource, supportCodeInitializer, configuration;
  var supportCodeLibrary;
  var context = {};

  beforeEach(function() {
    supportCodeLibrary       = createSpy("support code library");
    spyOn(Cucumber.SupportCode, 'Library').andReturn(supportCodeLibrary);
    featureSource            = createSpy("feature source");
    supportCodeInitializer   = createSpy("support code initializer");
    configuration            = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer);
    context['configuration'] = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("constructor", function() {
    it("creates a support code library with the initializer", function() {
      expect(Cucumber.SupportCode.Library).toHaveBeenCalledWith(supportCodeInitializer);
    });
  });

  describe("getFeatureSources()", function() {
    it("returns the feature source and its volatile name", function() {
      var featureNameSourcePair = [Cucumber.VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      var featureSources        = [featureNameSourcePair];
      expect(configuration.getFeatureSources()).toEqual(featureSources);
    })
  });

  describe("getSupportCodeLibrary()", function() {
    it("returns the support code library", function() {
      expect(configuration.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });
});

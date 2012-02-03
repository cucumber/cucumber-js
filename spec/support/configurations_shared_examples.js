itBehavesLikeAllCucumberConfigurations = function itBehavesLikeAllCucumberConfigurations(context) {
  var configuration;

  beforeEach(function() {
    configuration = context['configuration'];
  });

  it("supplies the feature sources", function() {
    expect(configuration.getFeatureSources).toBeAFunction();
  });

  it("supplies the support code library", function() {
    expect(configuration.getSupportCodeLibrary).toBeAFunction();
  });

  it("supplies the AST filter", function() {
    expect(configuration.getAstFilter).toBeAFunction();
  });
}

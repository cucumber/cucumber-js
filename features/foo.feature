Feature: Foo
  Scenario: output JSON for a feature with one scenario with failing step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declaired one step but it is failing
          Given This step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is failing$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
      """
    And CUCUMBER_JS_HOME environment variable has been set to the cucumber-js install dir
    When I run `cucumber.js -f json`
    Then it should output this json:
      """
      []
      """

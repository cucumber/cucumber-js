Feature: Failed scenarios
  As a developer nesting feature files
  I want the default required files to include any

  Scenario:
    Given a directory named "features/nested"
    Given a file named "features/nested/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step$/, function() { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0

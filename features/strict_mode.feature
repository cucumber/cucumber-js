Feature: Strict mode

  Using the `--strict` flag will cause cucumber to fail unless all the
  step definitions have been defined.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: Missing
        Scenario: Missing
          Given a step
      """

  Scenario: Succeed scenario with implemented step with --strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a step$/, function() {});
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0

  Scenario: Fail scenario with undefined step with --strict
    When I run cucumber.js with `--strict`
    Then the exit status should be 1

  Scenario: Fail Scenario with pending step with --strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a step$/, function() { return 'pending'; });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 1

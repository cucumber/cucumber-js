Feature: Dryrun mode

  Using the `--dry-run` or `-d` flag gives you a way to quickly scan your features without actually running them.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some scenario
        Scenario: some scenario
          Given a step
      """

  Scenario: default behavior
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given('a step', function() { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--dry-run`
    Then all steps have status "skipped"

  Scenario: ambiguous step
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given('a step', function() { });
        this.Given('an? step', function() { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--dry-run`
    Then the step "a step" has status "ambiguous"

  Scenario: undefined step
    When I run cucumber.js with `--dry-run`
    Then the step "a step" has status "undefined"

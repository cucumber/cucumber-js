Feature: Strict mode

  Using the `--strict` flag will cause cucumber to fail unless all the
  step definitions have been defined.

  Background:
    Given a file named "features/a.feature" with:
    """
    Feature: Missing
      Scenario: Missing
        Given this step passes
    """

  Scenario: Succeed scenario with implemented step with --strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    var cucumberSteps = function() {
      this.When(/^this step passes$/, function(callback) { callback(); });
    };
    module.exports = cucumberSteps;
    """
    When I run cucumber.js with `-f progress features/a.feature --strict`
    Then it outputs this text:
    """
    .

    1 scenario (1 passed)
    1 step (1 passed)
    <duration-stat>
    """
    And the exit status should be 0

  Scenario: Fail scenario with undefined step with --strict
    When I run cucumber.js with `-f progress features/a.feature --strict`
    Then the exit status should be 1


  Scenario: Fail Scenario with pending step with --strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    var cucumberSteps = function() {
      this.Given(/^this step passes$/, function(callback) { callback(null, 'pending'); });
    };
    module.exports = cucumberSteps;
    """
    When I run cucumber.js with `-f progress features/a.feature --strict`
    Then the exit status should be 1

  Scenario: Fail scenario with undefined step with -S
    When I run cucumber.js with `-f progress features/a.feature -S`
    Then the exit status should be 1


  Scenario: Fail Scenario with pending step with -S
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    var cucumberSteps = function() {
      this.Given(/^this step passes$/, function(callback) { callback(null, 'pending'); });
    };
    module.exports = cucumberSteps;
    """
    When I run cucumber.js with `-f progress features/a.feature -S`
    Then the exit status should be 1

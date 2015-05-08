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
    When I run `cucumber.js -f progress features/a.feature --strict`
    Then it outputs this text:
    """
    .

    1 scenario (1 passed)
    1 step (1 passed)

    """
    And the exit status should be 0

  Scenario: Fail scenario with undefined step with --strict
    When I run `cucumber.js -f progress features/a.feature --strict`
    Then it outputs this text:
    """
    U

    1 scenario (1 undefined)
    1 step (1 undefined)

    You can implement step definitions for undefined steps with these snippets:

    this.Given(/^this step passes$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });
    """
    And the exit status should be 1


  Scenario: Fail Scenario with pending step with --strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    var cucumberSteps = function() {
      this.Given(/^this step passes$/, function(callback) { callback.pending(); });
    };
    module.exports = cucumberSteps;
    """
    When I run `cucumber.js -f progress features/a.feature --strict`
    Then it outputs this text:
    """
    P

    1 scenario (1 pending)
    1 step (1 pending)
    """
    And the exit status should be 1

  Scenario: Fail scenario with undefined step with -S
    When I run `cucumber.js -f progress features/a.feature -S`
    Then it outputs this text:
    """
    U

    1 scenario (1 undefined)
    1 step (1 undefined)

    You can implement step definitions for undefined steps with these snippets:

    this.Given(/^this step passes$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });
    """
    And the exit status should be 1


  Scenario: Fail Scenario with pending step with -S
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    var cucumberSteps = function() {
      this.Given(/^this step passes$/, function(callback) { callback.pending(); });
    };
    module.exports = cucumberSteps;
    """
    When I run `cucumber.js -f progress features/a.feature -S`
    Then it outputs this text:
    """
    P

    1 scenario (1 pending)
    1 step (1 pending)
    """
    And the exit status should be 1

Feature: Target specific scenarios
  As a developer running features
  I want an easy way to run specific scenarios by line
  So that I don't waste time running my whole test suite when I don't need to

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          When a step is passing

        Scenario: second scenario
          When a step is passing

        Scenario Outline: third scenario
          When a step is <STATUS>

          Examples:
            | STATUS  |
            | passing |
            | pending |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function() { });
        this.When(/^a step is pending$/, function(callback) { callback.pending() });
      };
      module.exports = cucumberSteps;
      """

  Scenario: run a single scenario
    When I run cucumber.js with `features/a.feature:2`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: first scenario   # features/a.feature:2
          When a step is passing   # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run a single scenario outline
    When I run cucumber.js with `features/a.feature:8`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario Outline: third scenario   # features/a.feature:13
          When a step is passing           # features/step_definitions/cucumber_steps.js:2

        Scenario Outline: third scenario   # features/a.feature:14
          When a step is pending           # features/step_definitions/cucumber_steps.js:3

      2 scenarios (1 pending, 1 passed)
      2 steps (1 pending, 1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run a single scenario outline example
    When I run cucumber.js with `features/a.feature:13`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario Outline: third scenario   # features/a.feature:13
          When a step is passing           # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run multiple scenarios
    When I run cucumber.js with `features/a.feature:2:5`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: first scenario   # features/a.feature:2
          When a step is passing   # features/step_definitions/cucumber_steps.js:2

        Scenario: second scenario   # features/a.feature:5
          When a step is passing    # features/step_definitions/cucumber_steps.js:2

      2 scenarios (2 passed)
      2 steps (2 passed)
      <duration-stat>
      """
    And the exit status should be 0

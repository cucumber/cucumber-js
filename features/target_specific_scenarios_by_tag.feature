Feature: Target specific scenarios
  As a developer running features
  I want an easy way to run specific scenarios by tag
  So that I don't waste time running my whole test suite when I don't need to

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        @a
        Scenario: first scenario
          When a step is passing

        @b
        Scenario Outline: second scenario
          When a step is <STATUS>

          @c
          Examples:
            | STATUS  |
            | passing |
            | pending |

          @d
          Examples:
            | STATUS    |
            | undefined |
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
    When I run cucumber.js with `--tags @a`
    Then it outputs this text:
      """
      Feature: some feature

        @a
        Scenario: first scenario   # features/a.feature:3
          When a step is passing   # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run a single scenario outline
    When I run cucumber.js with `--tags @b`
    Then it outputs this text:
      """
      Feature: some feature

        @b @c
        Scenario Outline: second scenario   # features/a.feature:13
          When a step is passing            # features/step_definitions/cucumber_steps.js:2

        @b @c
        Scenario Outline: second scenario   # features/a.feature:14
          When a step is pending            # features/step_definitions/cucumber_steps.js:3

        @b @d
        Scenario Outline: second scenario   # features/a.feature:19
          When a step is undefined

      3 scenarios (1 undefined, 1 pending, 1 passed)
      3 steps (1 undefined, 1 pending, 1 passed)
      <duration-stat>

      You can implement step definitions for undefined steps with these snippets:

      this.When(/^a step is (.*)$/, function (status, callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
      });
      """
    And the exit status should be 0

  Scenario: run a single scenario outline examples
    When I run cucumber.js with `--tags @c`
    Then it outputs this text:
      """
      Feature: some feature

        @b @c
        Scenario Outline: second scenario   # features/a.feature:13
          When a step is passing            # features/step_definitions/cucumber_steps.js:2

        @b @c
        Scenario Outline: second scenario   # features/a.feature:14
          When a step is pending            # features/step_definitions/cucumber_steps.js:3

      2 scenarios (1 pending, 1 passed)
      2 steps (1 pending, 1 passed)
      <duration-stat>
      """
    And the exit status should be 0

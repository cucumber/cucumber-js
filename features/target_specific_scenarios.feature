Feature: Command line interface
  In order to run cucumber in different contexts
  As a person who wants to run features
  I want to run Cucumber on the command line

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          When a step is passing

        Scenario: second scenario
          When a step is passing

        Scenario: third scenario
          When a step does not exist
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """

  Scenario: run a single scenario within feature
    When I run cucumber.js with `-f progress features/a.feature:2`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run a multiple scenario within feature
    When I run cucumber.js with `-f progress features/a.feature:2:5`
    Then it outputs this text:
      """
      ..

      2 scenarios (2 passed)
      2 steps (2 passed)
      <duration-stat>
      """
    And the exit status should be 0


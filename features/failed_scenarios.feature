Feature: Failed scenarios
  In order to easily rerun failed scenarios
  I want Cucumber to print the relative path to each

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is failing$/, function(callback) { callback("forced error"); });
      };
      module.exports = cucumberSteps;
      """

  Scenario: from project directory
    When I run cucumber.js with `-f progress`
    Then it outputs this text:
      """
      F

      (::) failed steps (::)

      forced error

      Failing scenarios:
      features/a.feature:2 # Scenario:

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
    And the exit status should be 1


  Scenario: from nested features directory
    Given a directory named "features/nested"
    When I run cucumber.js from the "features/nested" directory with `../a.feature -f progress`
    Then it outputs this text:
      """
      F

      (::) failed steps (::)

      forced error

      Failing scenarios:
      ../a.feature:2 # Scenario:

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
    And the exit status should be 1

Feature: Failed scenarios
  In order to easily rerun failed scenarios
  I want Cucumber to print the relative path to each

  Scenario: from project directory
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          When a step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When(/^a step is failing$/, function() { throw "forced error" });
      })
      """
    When I run cucumber.js with `-f progress`
    Then it outputs this text:
      """
      F

      Failures:

      1) Scenario: some scenario - features/a.feature:2
         Step: When a step is failing - features/a.feature:3
         Step Definition: features/step_definitions/cucumber_steps.js:4
         Message:
           forced error

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
    And the exit status should be 1

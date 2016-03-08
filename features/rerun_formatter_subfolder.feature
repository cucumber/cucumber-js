Feature: Rerun Formatter

  As a developer
  I would like to be able to save my rerun results to a subfolder
  So that cucumber-js give me flexibility for where I store them

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: A
        Scenario: 1
          Given a passing step

        Scenario: 2
          Given a failing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a passing step$/, function() { });
        this.When(/^a failing step$/, function() { throw 'fail' });
      };
      module.exports = cucumberSteps;
      """
    And a file named "cucumber.js" with:
      """
      module.exports = {
        'default': '--format progress --format rerun:test_results/@rerun.txt',
      };
      """
    And a directory named "test_results"

  Scenario: saving @rerun.txt in subfolder
    When I run cucumber.js
    Then it outputs this text:
      """
      .F

      Failures:

      1) Scenario: 2 - features/a.feature:5
         Step: Given a failing step - features/a.feature:6
         Step Definition: features/step_definitions/cucumber_steps.js:3
         Message:
           fail

      2 scenarios (1 failed, 1 passed)
      2 steps (1 failed, 1 passed)
      <duration-stat>
      """
    And the file "test_results/@rerun.txt" has the text:
      """
      features/a.feature:5
      """
    When I run cucumber.js with `test_results/@rerun.txt`
    Then it outputs this text:
      """
      F

      Failures:

      1) Scenario: 2 - features/a.feature:5
         Step: Given a failing step - features/a.feature:6
         Step Definition: features/step_definitions/cucumber_steps.js:3
         Message:
           fail

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """

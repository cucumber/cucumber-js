Feature: Rerun Formatter

  As a developer
  I would like to be able to save my rerun results to a subfolder
  So that cucumber-js give me flexibility for where I store them

  Scenario: saving @rerun.txt in subfolder
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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      Given(/^a failing step$/, function() { throw 'fail' })
      """
    And a directory named "test_results"
    When I run cucumber-js with `--format rerun:test_results/@rerun.txt`
    Then it fails
    And the file "test_results/@rerun.txt" has the text:
      """
      features/a.feature:5
      """
    When I run cucumber-js with `test_results/@rerun.txt`
    Then it fails
    And it runs the scenario "2"

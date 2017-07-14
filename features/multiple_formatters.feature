Feature: Multiple Formatters

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function() {})
      })
      """

  Scenario: Ability to specify multiple formatters
    When I run cucumber.js with `-f progress -f summary:summary.txt`
    Then it outputs the text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the file "summary.txt" has the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario: Invalid path
    When I run cucumber.js with `-f progress -f pretty:invalid/pretty.txt`
    Then it fails
    And the error output contains the text:
      """
      ENOENT
      """

Feature: Formatter Paths

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      """

  Scenario: Relative path
    When I run cucumber-js with `-f summary:summary.txt`
    Then the file "summary.txt" has the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario: Absolute path
    Given "{{{tmpDir}}}" is an absolute path
    When I run cucumber-js with `-f summary:"{{{tmpDir}}}/summary.txt"`
    Then the file "{{{tmpDir}}}/summary.txt" has the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario: Created relative path
    When I run cucumber-js with `-f summary:some/long/path/for/reports/summary.txt`
    Then the file "some/long/path/for/reports/summary.txt" has the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """


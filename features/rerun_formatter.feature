Feature: Rerun Formatter

  In order to allow users to easily run only the failing scenarios
  Users can save the rerun formatter's output to a file and pass it as an argument on the next run

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: A
        Scenario: A - passing
          Given a passing step

        Scenario: A - failing
          Given a failing step

        Scenario: A - ambiguous
          Given an ambiguous step
      """
    And a file named "features/b.feature" with:
      """
      Feature: B
        Scenario: B - passing
          Given a passing step

        Scenario: B - pending
          Given a pending step
      """
    And a file named "features/c.feature" with:
      """
      Feature: C
        Scenario: C - passing
          Given a passing step

        Scenario: C - undefined
          Given an undefined step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^an ambiguous step$/, function() {})
      Given(/^an? ambiguous step$/, function() {})
      Given(/^a pending step$/, function() { return 'pending' })
      """

  Scenario: passing
    When I run cucumber-js with `--format rerun:@rerun.txt features/a.feature:2`
    And the file "@rerun.txt" has the text:
      """
      """

  Scenario: multiple scenarios failing
    When I run cucumber-js with `--format rerun:@rerun.txt`
    Then it fails
    And it runs the scenarios:
      | NAME          |
      | A - passing   |
      | A - failing   |
      | A - ambiguous |
      | B - passing   |
      | B - pending   |
      | C - passing   |
      | C - undefined |
    And the file "@rerun.txt" has the text:
      """
      features/a.feature:5:8
      features/b.feature:5
      features/c.feature:5
      """

  Scenario: rerunning failed scenarios
    Given a file named "@rerun.txt" with:
      """
      features/a.feature:5:8
      features/b.feature:5
      features/c.feature:5
      """
    When I run cucumber-js with `@rerun.txt`
    Then it fails
    And it runs the scenarios:
      | NAME          |
      | A - failing   |
      | A - ambiguous |
      | B - pending   |
      | C - undefined |

  Scenario: rerun file with trailing new line
    Given a file named "@rerun.txt" with:
      """
      features/c.feature:2

      """
    When I run cucumber-js with `@rerun.txt`
    Then it runs the scenario "C - passing"

  Scenario: empty rerun file exits without running any scenarios
    Given an empty file named "@rerun.txt"
    When I run cucumber-js with `@rerun.txt`
    Then it passes
    And it runs 0 scenarios

  Scenario: rerun with fail fast outputs all skipped scenarios
    When I run cucumber-js with `--fail-fast --format rerun:@rerun.txt`
    Then it fails
    And the file "@rerun.txt" has the text:
      """
      features/a.feature:5:8
      features/b.feature:2:5
      features/c.feature:2:5
      """

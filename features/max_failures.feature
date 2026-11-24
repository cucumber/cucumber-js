Feature: Max failures

  Using the `--max-failures` option ends the suite once the given number of scenarios have failed

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing 1
          Given a failing step

        Scenario: Passing 1
          Given a passing step

        Scenario: Failing 2
          Given a failing step

        Scenario: Failing 3
          Given a failing step

        Scenario: Passing 2
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^a passing step$/, function() {})
      """

  Scenario Outline: stops after the given number of failures
    When I run cucumber-js with `<args>`
    Then scenario "Failing 1" has status "failed"
    And scenario "Passing 1" has status "passed"
    And scenario "Failing 2" has status "failed"
    And scenario "Failing 3" has status "skipped"
    And scenario "Passing 2" has status "skipped"
    And it fails

    Examples:
      | args                          |
      | --max-failures 2              |
      | --max-failures 2 --parallel 1 |

  Scenario: set in a configuration file
    Given a file named "cucumber.json" with:
      """
      {
        "default": {
          "maxFailures": 2
        }
      }
      """
    When I run cucumber-js
    Then scenario "Failing 2" has status "failed"
    And scenario "Failing 3" has status "skipped"
    And scenario "Passing 2" has status "skipped"
    And it fails

  Scenario: 0 means no limit
    When I run cucumber-js with `--max-failures 0`
    Then scenario "Failing 3" has status "failed"
    And scenario "Passing 2" has status "passed"
    And it fails

  Scenario: the lower limit applies when combined with --fail-fast
    When I run cucumber-js with `--fail-fast --max-failures 2`
    Then scenario "Failing 1" has status "failed"
    And scenario "Passing 1" has status "skipped"
    And scenario "Failing 2" has status "skipped"
    And it fails

  Scenario: a scenario that passes on retry does not count towards the limit
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step

        Scenario: Failing
          Given a failing step

        Scenario: Passing
          Given a passing step
      """
    And a file named "features/step_definitions/flaky_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--max-failures 1 --retry 1`
    Then scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And scenario "Failing" has status "failed"
    And scenario "Passing" has status "skipped"
    And it fails

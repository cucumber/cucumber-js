Feature: Fail fast

  Using the `--fail-fast` flag ends the suite after the first failure

  Scenario: --fail-fast
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step

        Scenario: Passing
          Given a passing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^a passing step$/, function() {})
      """
    When I run cucumber-js with `--fail-fast`
    Then scenario "Passing" step "Given a passing step" has status "skipped"
    And it fails

  Scenario: --max-failures skips subsequent scenarios after limit is reached
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing 1
          Given a failing step

        Scenario: Failing 2
          Given a failing step

        Scenario: Skipped 3
          Given a passing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^a passing step$/, function() {})
      """
    When I run cucumber-js with `--max-failures 2`
    Then scenario "Skipped 3" step "Given a passing step" has status "skipped"
    And it fails

  Scenario: --max-failures allows execution when failures do not reach limit
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing 1
          Given a failing step

        Scenario: Passing 2
          Given a passing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^a passing step$/, function() {})
      """
    When I run cucumber-js with `--max-failures 2`
    Then scenario "Passing 2" step "Given a passing step" has status "passed"
    And it fails

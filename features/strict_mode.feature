Feature: Strict mode

  Using the `--no-strict` flag will cause cucumber to succeed even if there are
  undefined or pending steps.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: Missing
        Scenario: Missing
          Given a step
      """

  Scenario: Fail with undefined step by default
    When I run cucumber.js
    Then the exit status should be 1

  Scenario: Succeed with undefined step with --no-strict
    When I run cucumber.js with `--no-strict`
    Then the exit status should be 0

  Scenario: Fail with pending step by default
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a step$/, function() { return 'pending' })
      })
      """
    When I run cucumber.js
    Then the exit status should be 1

  Scenario: Succeed with pending step with --no-strict
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a step$/, function() { return 'pending' })
      })
      """
    When I run cucumber.js with `--no-strict`
    Then the exit status should be 0

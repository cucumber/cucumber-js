Feature: Strict mode

  Using the `--no-strict` flag will cause cucumber to succeed even if there are
  pending steps.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: Missing
        Scenario: Missing
          Given a step
      """

  Scenario: Fail with pending step by default
    Given a file named "features/step_definitions/cucumber_steps.ts" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() { return 'pending' })
      """
    When I run cucumber-js
    Then it fails

  Scenario: Succeed with pending step with --no-strict
    Given a file named "features/step_definitions/cucumber_steps.ts" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() { return 'pending' })
      """
    When I run cucumber-js with `--no-strict`
    Then it passes

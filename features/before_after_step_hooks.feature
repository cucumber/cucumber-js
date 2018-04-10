Feature: Before and After Step Hooks

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {})
      """

  Scenario: Failing before step fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      import {BeforeStep} from 'cucumber'

      BeforeStep(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  Scenario: Failing after step fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      import {AfterStep} from 'cucumber'

      AfterStep(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      import { BeforeStep } from 'cucumber'

      BeforeStep('@any-tag', function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      import { AfterStep } from 'cucumber'

      AfterStep('@any-tag', function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it passes

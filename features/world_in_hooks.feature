Feature: World in Hooks

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
    And a file named "features/support/world.js" with:
      """
      import {setWorldConstructor} from 'cucumber'

      function WorldConstructor() {
        return {
          isWorld: function() { return true }
        }
      }

      setWorldConstructor(WorldConstructor)
      """

  Scenario: World is this in hooks
    Given a file named "features/support/hooks.js" with:
      """
      import {After, Before } from 'cucumber'

      Before(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })

      After(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: World is this in BeforeStep hooks
    Given a file named "features/support/hooks.js" with:
      """
      import {BeforeStep } from 'cucumber'

      BeforeStep(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: World is this in AfterStep hooks
    Given a file named "features/support/hooks.js" with:
      """
      import {AfterStep } from 'cucumber'

      AfterStep(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })
      """
    When I run cucumber-js
    Then it passes

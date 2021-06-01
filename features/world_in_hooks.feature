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
      const {Given} = require('@cucumber/cucumber')
      Given(/^a step$/, function() {})
      """
    And a file named "features/support/world.js" with:
      """
      const {setWorldConstructor} = require('@cucumber/cucumber')
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
      const {After, Before } = require('@cucumber/cucumber')
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
      const {BeforeStep } = require('@cucumber/cucumber')
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
      const {AfterStep } = require('@cucumber/cucumber')
      AfterStep(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })
      """
    When I run cucumber-js
    Then it passes

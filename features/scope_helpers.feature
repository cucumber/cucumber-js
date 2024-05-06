Feature: Scope helpers

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/support/world.js" with:
      """
      const {setWorldConstructor,World} = require('@cucumber/cucumber')
      setWorldConstructor(class WorldConstructor extends World {
        isWorld() { return true }
      })
      """
    And a file named "cucumber.json" with:
    """
    {
      "default": {
        "worldParameters": {
          "a": 1
        }
      }
    }
    """

  Scenario: getWorld and getContext can be used from appropriate scopes
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {BeforeAll,Given,BeforeStep,Before,getWorld,getContext} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      BeforeAll(() => assert.equal(getContext().parameters.a, 1))
      Given('a step', () => assert(getWorld().isWorld()))
      BeforeStep(() => assert(getWorld().isWorld()))
      Before(() => assert(getWorld().isWorld()))
      """
    When I run cucumber-js
    Then it passes

  Scenario: getWorld cannot be used outside correct scope
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {BeforeAll,getWorld} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      BeforeAll(() => assert(getWorld().isWorld()))
      """
    When I run cucumber-js
    Then it fails

  Scenario: getContext cannot be used outside correct scope
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given,getContext} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      Given(() => console.log(getContext().parameters))
      """
    When I run cucumber-js
    Then it fails

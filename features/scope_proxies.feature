Feature: Scope proxies

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

  Scenario: world and context can be used from appropriate scopes
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {BeforeAll,Given,BeforeStep,Before,world,context} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      BeforeAll(() => assert.equal(context.parameters.a, 1))
      Given('a step', () => assert(world.isWorld()))
      BeforeStep(() => assert(world.isWorld()))
      Before(() => assert(world.isWorld()))
      """
    When I run cucumber-js
    Then it passes

  Scenario: world proxy cannot be used outside correct scope
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {BeforeAll,world} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      BeforeAll(() => assert(world.isWorld()))
      """
    When I run cucumber-js
    Then it fails

  Scenario: context proxy cannot be used outside correct scope
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given,context} = require('@cucumber/cucumber')
      const assert = require('node:assert/strict')

      Given(() => console.log(context.parameters))
      """
    When I run cucumber-js
    Then it fails
Feature: Multiple Hooks

  Scenario: before hooks run in the order of definition, after hooks in reverse order of definition
    Given a file named "features/a.feature" with:
      """
      @foo
      Feature:
        Scenario:
          Given a step

        Scenario:
          Given a step
      """
    And a file named "features/step_definitions/world.js" with:
      """
      const {setWorldConstructor} = require('@cucumber/cucumber')

      setWorldConstructor(function() {
        this.value = 0
      })
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {})
      """
    And a file named "features/step_definitions/hooks.js" with:
      """
      const {After, Before} = require('@cucumber/cucumber')
      const assert = require('assert')

      Before(function() {
        assert.equal(this.value, 0)
        this.value += 1
      })

      After(function() {
        assert.equal(this.value, 3)
      })

      Before({tags: '@foo'}, function() {
        assert.equal(this.value, 1)
        this.value += 1
      })

      After({tags: '@foo'}, function() {
        assert.equal(this.value, 2)
        this.value += 1
      })
      """
    When I run cucumber-js
    Then it passes

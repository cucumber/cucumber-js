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
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({setWorldConstructor}) => {
        setWorldConstructor(function() {
          this.value = 0
        })
      })
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given('a step', function() {})
      })
      """
    And a file named "features/step_definitions/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({After, Before}) => {
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
      })
      """
    When I run cucumber.js
    Then it passes

Feature: Tagged Hooks
  As a developer running features
  I want the ability to control which scenarios my hooks run for
  Because not all my scenarios have the same setup and teardown

  Scenario: ability to specify tags for hooks
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Then the value is 0

        @foo
        Scenario:
          Then the value is 1
      """
    And a file named "features/step_definitions/world.js" with:
      """
      import {setWorldConstructor} from 'cucumber'

      setWorldConstructor(function() {
        this.value = 0
      })
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      import assert from 'assert'
      import {Then} from 'cucumber'

      Then(/^the value is (\d*)$/, function(number) {
        assert.equal(number, this.value)
      })
      """
    And a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      import {Before} from 'cucumber'

      Before({tags: '@foo'}, function() {
        this.value += 1
      })
      """
    When I run cucumber-js
    Then it passes

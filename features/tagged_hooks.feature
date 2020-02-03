Feature: Tagged Hooks
  As a developer running features
  I want the ability to control which scenarios my hooks run for
  Because not all my scenarios have the same setup and teardown

  Scenario: ability to specify tags for hooks
    Given a file named "features/a.feature" with:
      """
      @foo
      Feature:
        Scenario:
          Then foo is true
          And bar is false

        @bar
        Scenario:
          Then foo is true
          And bar is true
      """
    And a file named "features/step_definitions/world.js" with:
      """
      const {setWorldConstructor} = require('cucumber')

      setWorldConstructor(function() {
        this.foo = false
        this.bar = false
      })
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Then} = require('cucumber')

      Then('{word} is true', function(prop) {
        assert.equal(true, this[prop])
      })

      Then('{word} is false', function(prop) {
        assert.equal(false, this[prop])
      })
      """
    And a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      const {Before} = require('cucumber')

      Before({tags: '@foo'}, function() {
        this.foo = true
      })

      Before({tags: '@bar'}, function() {
        this.bar = true
      })
      """
    When I run cucumber-js
    Then it passes

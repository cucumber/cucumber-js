Feature: Tagged Hooks
  As a developer running features
  I want the ability to control which scenarios my hooks run for
  Because not all my scenarios have the same setup and teardown

  Background:
    Given a file named "features/step_definitions/world.js" with:
      """
      const {setWorldConstructor} = require('@cucumber/cucumber')

      setWorldConstructor(function() {
        this.foo = false
        this.bar = false
      })
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Then} = require('@cucumber/cucumber')

      Then('{word} is true', function(prop) {
        assert.equal(true, this[prop])
      })

      Then('{word} is false', function(prop) {
        assert.equal(false, this[prop])
      })
      """
    And a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      const {Before} = require('@cucumber/cucumber')

      Before({tags: '@foo'}, function() {
        this.foo = true
      })

      Before({tags: '@bar'}, function() {
        this.bar = true
      })
      """

  Scenario: hooks filtered by tags on scenario
    Given a file named "features/a.feature" with:
      """
      Feature:
        @foo
        Scenario:
          Then foo is true
          And bar is false
      """
    When I run cucumber-js
    Then it passes

  Scenario: tags cascade from feature to scenario
    Given a file named "features/a.feature" with:
      """
      @foo
      Feature:
        Scenario:
          Then foo is true
          And bar is false
      """
    When I run cucumber-js
    Then it passes

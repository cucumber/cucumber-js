Feature: Before/After All Hooks Context

  It should be possible to preserve context from a BeforeAll hook
  and have the context be available to the scenarios in the World

  Background:
    Given a file named "cucumber.json" with:
    """
    {
      "default": {
        "worldParameters": {
          "widgets": true
        }
      }
    }
    """
    And a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given first step

        Scenario: second scenario
          Given second step
      """

  Scenario: BeforeAll hooks can update world parameters before tests start
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      BeforeAll(function() {
        expect(this.parameters).to.deep.eq({
          widgets: true
        })
        this.parameters.foo = 1
      })

      Given('first step', function() {
        expect(this.parameters).to.deep.eq({
          widgets: true,
          foo: 1
        })
      })

      Given('second step', function() {
        expect(this.parameters).to.deep.eq({
          widgets: true,
          foo: 1
        })
      })

      AfterAll(function() {
        expect(this.parameters).to.deep.eq({
          widgets: true,
          foo: 1
        })
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Many BeforeAll hooks can accumulate updates to the world parameters
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      BeforeAll(function() {
        this.parameters.foo = 1
      })

      BeforeAll(function() {
        this.parameters.bar = 2
      })

      Given('first step', function() {
        expect(this.parameters).to.deep.eq({
          widgets: true,
          foo: 1,
          bar: 2
        })
      })

      Given('second step', function() {})
      """
    When I run cucumber-js
    Then it passes

  Scenario: Works the same way on the parallel runtime
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      BeforeAll(function() {
        this.parameters.foo = 1
      })

      Given('first step', function() {
        expect(this.parameters).to.deep.eq({
          widgets: true,
          foo: 1
        })
      })

      Given('second step', function() {})
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes


Feature: World Parameters
  As a developer testing multiple environments
  I would like the ability to pass in parameters to the world constructor through the CLI
  So I can easily switch to

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given the world parameters are correct
      """

  @spawn
  Scenario: Invalid JSON
    When I run cucumber-js with `--world-parameters '{"a":}'`
    Then it fails
    And the error output contains the text:
      """
      --world-parameters passed invalid JSON: Unexpected token
      """
    And the error output contains the text:
      """
      {"a":}
      """

  @spawn
  Scenario: Non-object
    When I run cucumber-js with `--world-parameters '[1,2]'`
    Then it fails
    And the error output contains the text:
      """
      --world-parameters must be passed JSON of an object: [1,2]
      """

  Scenario: default world constructor has an empty parameters object by default
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given(/^the world parameters are correct$/, function() {
        assert.deepEqual(this.parameters, {})
      })
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given the world parameters are correct" has status "passed"

  Scenario: default world constructor saves the parameters
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given(/^the world parameters are correct$/, function() {
        assert.equal(this.parameters.a, 1)
      })
      """
    When I run cucumber-js with `--world-parameters '{"a":1}'`
    Then scenario "a scenario" step "Given the world parameters are correct" has status "passed"

  Scenario: multiple world parameters are merged with the last taking precedence
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given(/^the world parameters are correct$/, function() {
        assert.equal(this.parameters.a, 3)
        assert.equal(this.parameters.b, 2)
      })
      """
    When I run cucumber-js with `--world-parameters '{"a":1,"b":2}' --world-parameters '{"a":3}'`
    Then scenario "a scenario" step "Given the world parameters are correct" has status "passed"

  Scenario: custom world constructor is passed the parameters
    Given a file named "features/support/world.js" with:
      """
      const {setWorldConstructor} = require('@cucumber/cucumber')

      function CustomWorld(options) {
        for(const key in options.parameters) {
          this[key] = options.parameters[key]
        }
      }

      setWorldConstructor(CustomWorld)
      """
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given(/^the world parameters are correct$/, function() {
        assert.equal(this.a, 1)
      })
      """
    When I run cucumber-js with `--world-parameters '{"a":1}'`
    Then scenario "a scenario" step "Given the world parameters are correct" has status "passed"

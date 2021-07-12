Feature: Parameter types

  Users can define their own parameter types to be used in Cucumber expressions.
  Custom parameter types can be used to match certain patterns, and optionally to
  transform the matched value into a custom type.

  Background:
    Given a file named "features/particular_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a particular step
      """
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')

      Given('a {param} step', function(param) {
        assert.equal(param, 'PARTICULAR')
      })
      """

  Scenario: delegate transform to world
    Given a file named "features/support/transforms.js" with:
      """
      const {setWorldConstructor, defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        transformer(s) {
          return this.upcase(s)
        },
        name: 'param'
      })

      class MyWorld {
        upcase(s) {
          return s.toUpperCase()
        }
      }
      setWorldConstructor(MyWorld)
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a particular step" has status "passed"

  Scenario: sync transform (success)
    Given a file named "features/support/transforms.js" with:
      """
      const {defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        transformer: s => s.toUpperCase(),
        name: 'param'
      })
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a particular step" has status "passed"

  Scenario: sync transform (error)
    Given a file named "features/support/transforms.js" with:
      """
      const {defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        transformer: s => {
          throw new Error('transform error')
        },
        name: 'param'
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a particular step" failed with:
      """
      transform error
      """

  Scenario: no transform
    Given a file named "features/support/transforms.js" with:
      """
      const {defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        name: 'param'
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a particular step" failed with:
      """
      AssertionError
      """

  Scenario: async transform (success)
    Given a file named "features/step_definitions/particular_steps.js" with:
      """
      const {defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        transformer: s => Promise.resolve(s.toUpperCase()),
        name: 'param'
      })
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a particular step" has status "passed"

  Scenario: async transform (error)
    Given a file named "features/step_definitions/particular_steps.js" with:
      """
      const {defineParameterType} = require('@cucumber/cucumber')

      defineParameterType({
        regexp: /particular/,
        transformer: s => Promise.reject(new Error('transform error')),
        name: 'param'
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a particular step" failed with:
      """
      transform error
      """

  Scenario: undefined parameter type
    When I run cucumber-js with `-f progress`
    Then it fails
    And the output contains the text:
      """
      Undefined parameter types:

      - "param" e.g. `a {param} step`
      """

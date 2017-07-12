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
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given('a {param} step', function(param) {
          assert.equal(param, 'PARTICULAR')
        })
      })
      """

  Scenario: sync transform (success)
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({defineParameterType}) => {
        defineParameterType({
          regexp: /particular/,
          transformer: s => s.toUpperCase(),
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then the step "a particular step" has status "passed"

  @spawn
  Scenario: sync transform (success) using deprecated addTransform API
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({addTransform}) => {
        addTransform({
          captureGroupRegexps: /particular/,
          transformer: s => s.toUpperCase(),
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then the step "a particular step" has status "passed"

  Scenario: sync transform (error)
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({defineParameterType}) => {
        defineParameterType({
          regexp: /particular/,
          transformer: s => {
            throw new Error('transform error')
          },
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a particular step" failed with:
      """
      transform error
      """

  Scenario: no transform
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({defineParameterType}) => {
        defineParameterType({
          regexp: /particular/,
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a particular step" failed with:
      """
      AssertionError
      """

  Scenario: async transform (success)
    Given a file named "features/step_definitions/particular_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({defineParameterType}) => {
        defineParameterType({
          regexp: /particular/,
          transformer: s => Promise.resolve(s.toUpperCase()),
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then the step "a particular step" has status "passed"

  Scenario: async transform (error)
    Given a file named "features/step_definitions/particular_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({defineParameterType}) => {
        defineParameterType({
          regexp: /particular/,
          transformer: s => Promise.reject(new Error('transform error')),
          typeName: 'param'
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a particular step" failed with:
      """
      transform error
      """

  Scenario: duplicate capture group regex
    Given a file named "features/support/my_parameter_types.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({defineParameterType, When}) => {
        defineParameterType({
          regexp: /"[^"]+"/,
          transformer: JSON.parse,
          typeName: 'stringInDoubleQuotes2'
        })
      })
      """
    When I run cucumber.js with `-f progress`
    Then the error output contains the text:
      """
      There is already a parameter with regexp "[^"]+"
      """
    And it fails

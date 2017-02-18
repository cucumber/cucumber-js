Feature: Custom Parameter

  Users can register their own parameters to be used in Cucumber expressions.
  Custom parameters can be used to match certain patterns, and optionally to
  transform the matched value into a custom type.

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a generic step
      """

  Scenario: custom parameter
    Given a file named "features/step_definitions/parameterized_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, defineParameterType}) => {
        defineParameterType({
          regexp: /generic|specific/,
          transformer: s => s.toUpperCase(),
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          assert.equal(status, 'GENERIC')
        })
      })
      """
    When I run cucumber.js
    Then the step "a generic step" has status "passed"

  Scenario: custom parameter without transformer
    Given a file named "features/step_definitions/parameterized_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, defineParameterType}) => {
        defineParameterType({
          regexp: /generic|specific/,
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          assert.equal(status, 'generic')
        })
      })
      """
    When I run cucumber.js
    Then the step "a generic step" has status "passed"

  Scenario: custom parameter (legacy API)
    Given a file named "features/step_definitions/parameterized_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, addTransform}) => {
        addTransform({
          captureGroupRegexps: /generic|specific/,
          transformer: s => s.toUpperCase(),
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          assert.equal(status, 'GENERIC')
        })
      })
      """
    When I run cucumber.js
    Then the step "a generic step" has status "passed"

  Scenario: custom transform throwing exception
    Given a file named "features/step_definitions/parameterized_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, defineParameterType}) => {
        defineParameterType({
          regexp: /generic|specific/,
          transformer: s => { throw new Error(`the parameter transform of [${s}] failed`) },
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          throw new Error('should never get here')
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a generic step" failed with:
      """
      the parameter transform of [generic] failed
      """

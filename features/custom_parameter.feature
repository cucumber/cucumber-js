Feature: Custom Parameter

  Users can register their own parameters to be used in Cucumber expressions.
  Custom parameters can be used to match certain patterns, and optionally to
  transform the matched value into a custom type.

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """

  Scenario: custom parameter
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, addParameter}) => {
        addParameter({
          captureGroupRegexps: /passing|failing|undefined|pending/,
          transformer: s => s.toUpperCase(),
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          assert.equal(status, 'PASSING')
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

  Scenario: custom parameter (legacy API)
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      defineSupportCode(({Given, addTransform}) => {
        addTransform({
          captureGroupRegexps: /passing|failing|undefined|pending/,
          transformer: s => s.toUpperCase(),
          typeName: 'status'
        })
        Given('a {status} step', function(status) {
          assert.equal(status, 'PASSING')
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"
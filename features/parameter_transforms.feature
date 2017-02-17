Feature: Parameter transforms

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given('a {status} step', function(status) {
          assert.equal(status, 'PASSING')
        })
      })
      """

  Scenario: sync transform (success)
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({addTransform}) => {
        addTransform({
          captureGroupRegexps: ['passing'],
          transformer: s => s.toUpperCase(),
          typeName: 'status'
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

  Scenario: sync transform (error)
    Given a file named "features/support/transforms.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({addTransform}) => {
        addTransform({
          captureGroupRegexps: ['passing'],
          transformer: s => {
            throw new Error('transform error')
          },
          typeName: 'status'
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a passing step" failed with:
      """
      transform error
      """

  Scenario: async transform (success)
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({addTransform}) => {
        addTransform({
          captureGroupRegexps: ['passing'],
          transformer: s => Promise.resolve(s.toUpperCase()),
          typeName: 'status'
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

  Scenario: async transform (error)
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({addTransform}) => {
        addTransform({
          captureGroupRegexps: ['passing'],
          transformer: s => {
            return new Promise(function (resolve, reject) {
              reject(new Error('transform error')
            })
          }
          typeName: 'status'
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the step "a passing step" failed with:
      """
      transform error
      """

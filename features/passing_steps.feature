Feature: Passing steps

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """

  Scenario: synchronous
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function() {})
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

  Scenario: asynchronous
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function(callback) {
          setTimeout(callback)
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

  Scenario: promise
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function() {
          return Promise.resolve()
        })
      })
      """
    When I run cucumber.js
    Then the step "a passing step" has status "passed"

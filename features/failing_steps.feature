Feature: Failing steps

  Background:
    Given a file named "features/fail.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a failing step
      """

  Scenario: too few arguments
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a (.*) step$/, function() {})
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      function has 0 arguments, should have 1 (if synchronous or returning a promise) or 2 (if accepting a callback)
      """

  Scenario: too many arguments
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function(arg1, arg2) {})
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      function has 2 arguments, should have 0 (if synchronous or returning a promise) or 1 (if accepting a callback)
      """

  Scenario: synchronous - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function() {
        throw new Error('my error');
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      my error
      """

  @spawn
  Scenario: asynchronous - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function(callback) {
        setTimeout(function() {
          throw new Error('the expected error in an async step')
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      the expected error in an async step
      """

  Scenario: asynchronous - passing error as first argument to the callback
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function(callback) {
        setTimeout(function() {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      my error
      """

  Scenario: asynchronous - using a callback and returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function(callback) {
        return Promise.resolve()
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      function uses multiple asynchronous interfaces: callback and promise
      to use the callback interface: do not return a promise
      to use the promise interface: remove the last argument to the function
      """

  @spawn
  Scenario: promise - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function() {
        return new Promise(function() {
          setTimeout(function() {
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      my error
      """

  Scenario: promise - rejects
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a failing step$/, function() {
        return Promise.reject(new Error('my error'))
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a failing step" failed with:
      """
      my error
      """

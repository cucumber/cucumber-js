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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a passing step" has status "passed"

  Scenario: asynchronous
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function(callback) {
        setTimeout(callback)
      })
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a passing step" has status "passed"

  Scenario: promise
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {
        return Promise.resolve()
      })
      """
    When I run cucumber-js
    Then scenario "a scenario" step "Given a passing step" has status "passed"

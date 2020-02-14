Feature: Formatters

  Scenario: rejected pickle from Scenario
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with all formatters and `--tags @a`
    Then the "message" formatter output matches the fixture "formatters/rejected-pickle-scenario.message.json"
    Then the "json" formatter output matches the fixture "formatters/rejected-pickle.json"

  @rule
  Scenario: rejected pickle from Rule
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Rule: a rule
          Example: an example
            Given a step
      """
    When I run cucumber-js with all formatters and `--tags @a`
    Then the "message" formatter output matches the fixture "formatters/rejected-pickle-rule.message.json"
    Then the "json" formatter output matches the fixture "formatters/rejected-pickle.json"

  Scenario: passed from Scenario
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/passed-scenario.message.json"
    Then the "json" formatter output matches the fixture "formatters/passed-scenario.json"

  @rule
  Scenario: passed from Rule
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Rule: a rule
          Example: an example
            Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/passed-rule.message.json"
    Then the "json" formatter output matches the fixture "formatters/passed-rule.json"

  Scenario: failed from Scenario
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      Given(/^a step$/, function(callback) { callback(new Error('my error')) })
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/failed-scenario.message.json"
    Then the "json" formatter output matches the fixture "formatters/failed-scenario.json"
    And it fails

  @rule
  Scenario: failed from Rule
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Rule: a rule
          Example: an example
            Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      Given(/^a step$/, function(callback) { callback(new Error('my error')) })
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/failed-rule.message.json"
    And it fails

  Scenario: retried and passed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      let willPass = false

      Given(/^a step$/, function(callback) {
        if (willPass) {
          callback()
          return
        }
        willPass = true
        callback(new Error('my error'))
      })
      """
    When I run cucumber-js with all formatters and `--retry 1`
    Then the "message" formatter output matches the fixture "formatters/retried.message.json"
    Then the "json" formatter output matches the fixture "formatters/retried.json"

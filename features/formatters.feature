Feature: Formatters

  Scenario: rejected pickle
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with all formatters and `--tags @a`
    Then the message formatter output matches the fixture "formatters/rejected-pickle.message.json"
    Then the json formatter output matches the fixture "formatters/rejected-pickle.json"
    Then the html formatter output is complete

  Scenario: passed from Scenario
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the message formatter output matches the fixture "formatters/passed-scenario.message.json"
    Then the json formatter output matches the fixture "formatters/passed-scenario.json"
    Then the html formatter output is complete

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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the message formatter output matches the fixture "formatters/passed-rule.message.json"
    Then the json formatter output matches the fixture "formatters/passed-rule.json"
    Then the html formatter output is complete

  Scenario: failed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function(callback) { callback(new Error('my error')) })
      """
    When I run cucumber-js with all formatters
    Then the message formatter output matches the fixture "formatters/failed.message.json"
    Then the json formatter output matches the fixture "formatters/failed.json"
    Then the html formatter output is complete
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
      const {Given} = require('@cucumber/cucumber')

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
    Then the message formatter output matches the fixture "formatters/retried.message.json"
    Then the json formatter output matches the fixture "formatters/retried.json"
    Then the html formatter output is complete

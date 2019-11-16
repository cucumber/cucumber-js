Feature: Formatters

  Scenario: gherkin error
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
          Examples:
            | a | b |
      """
    When I run cucumber-js with all formatters
    Then the "event-protocol" formatter output matches the fixture "formatters/gherkin-error.event-protocol"
    Then the "json" formatter output matches the fixture "formatters/gherkin-error.json"
    And it fails

  Scenario: rejected pickle
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with all formatters and `--tags @a`
    Then the "event-protocol" formatter output matches the fixture "formatters/rejected-pickle.event-protocol"
    Then the "json" formatter output matches the fixture "formatters/rejected-pickle.json"

  Scenario: passed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the "event-protocol" formatter output matches the fixture "formatters/passed.event-protocol"
    Then the "json" formatter output matches the fixture "formatters/passed.json"

  Scenario: failed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function(callback) { callback(new Error('my error')) })
      """
    When I run cucumber-js with all formatters
    Then the "event-protocol" formatter output matches the fixture "formatters/failed.event-protocol"
    Then the "json" formatter output matches the fixture "formatters/failed.json"
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
      import {Given} from 'cucumber'

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
    Then the "event-protocol" formatter output matches the fixture "formatters/retried.event-protocol"
    Then the "json" formatter output matches the fixture "formatters/retried.json"

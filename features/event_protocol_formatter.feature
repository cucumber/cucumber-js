Feature: Event Protocol Formatter

  Scenario: gherkin error
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
          Examples:
            | a | b |
      """
    When I run cucumber-js with `--tags @a -f event-protocol`
    Then the output matches the fixture "event_protocol_formatter/gherkin-error.ndjson"
    And it fails

  Scenario: rejected pickle
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with `--tags @a -f event-protocol`
    Then the output matches the fixture "event_protocol_formatter/rejected-pickle.ndjson"

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
    When I run cucumber-js with `-f event-protocol`
    Then the output matches the fixture "event_protocol_formatter/passed.ndjson"

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
    When I run cucumber-js with `-f event-protocol`
    Then the output matches the fixture "event_protocol_formatter/failed.ndjson"
    And it fails

  Scenario: retrying a flaky test will eventually make it pass
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
    When I run cucumber-js with `--retry 1 -f event-protocol`
    Then the output matches the fixture "event_protocol_formatter/retried.ndjson"

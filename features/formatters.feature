Feature: Formatters

  Scenario: rejected pickle
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with all formatters and `--tags @a`
    Then the "message" formatter output matches the fixture "formatters/rejected-pickle.message.json"
    Then the "json" formatter output matches the fixture "formatters/rejected-pickle.json"

  Scenario: passed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.ts" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/passed.message.json"
    Then the "json" formatter output matches the fixture "formatters/passed.json"

  Scenario: failed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.ts" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function(callback) { callback(new Error('my error')) })
      """
    When I run cucumber-js with all formatters
    Then the "message" formatter output matches the fixture "formatters/failed.message.json"
    Then the "json" formatter output matches the fixture "formatters/failed.json"
    And it fails

  Scenario: retried and passed
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    Given a file named "features/step_definitions/steps.ts" with:
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
    Then the "message" formatter output matches the fixture "formatters/retried.message.json"
    Then the "json" formatter output matches the fixture "formatters/retried.json"

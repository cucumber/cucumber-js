Feature: Step definition timeouts

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({Given, setDefaultTimeout}) => {
        setDefaultTimeout(500)

        Given(/^a callback step runs slowly$/, function(callback) {
          setTimeout(callback, 1000)
        })

        Given(/^a callback step runs slowly with an increased timeout$/, {timeout: 1500}, function(callback) {
          setTimeout(callback, 1000)
        })

        Given(/^a callback step with a disabled timeout$/, {timeout: -1}, function(callback) {
          setTimeout(callback, 1000)
        })

        Given(/^a promise step runs slowly$/, function() {
          return Promise.resolve().delay(1000)
        })

        Given(/^a promise step runs slowly with an increased timeout$/, {timeout: 1500}, function() {
          return Promise.resolve().delay(1000)
        })

        Given(/^a promise step with a disabled timeout$/, {timeout: -1}, function() {
          return Promise.resolve().delay(1000)
        })
      })
      """

  Scenario Outline: slow steps timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      function timed out after 500 milliseconds
      """

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: slow steps can increase their timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly with an increased timeout
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: changing step timeouts does not effect other steps
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly with an increased timeout
          And a <TYPE> step runs slowly
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      function timed out after 500 milliseconds
      """

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: steps can disable timeouts
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step with a disabled timeout
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE     |
      | callback |
      | promise  |

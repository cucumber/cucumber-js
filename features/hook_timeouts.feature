Feature: Step definition timeouts

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Before, Given, setDefaultTimeout} = require('@cucumber/cucumber')

      setDefaultTimeout(500);

      Before({tags: '@slow-with-increased-timeout', timeout: 1500}, function(scenario, callback) {
        setTimeout(callback, 1000)
      })

      Before({tags: '@slow'}, function(scenario, callback) {
        setTimeout(callback, 1000)
      })

      Before({tags: '@disabled', timeout: -1}, function(scenario, callback) {
        setTimeout(callback, 1000)
      })

      Given(/^a passing step$/, function() {})
      """

  Scenario: slow hooks timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        @slow
        Scenario:
          Given a passing step
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      function timed out, ensure the callback is executed within 500 milliseconds
      """


  Scenario: slow hooks can increase their timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        @slow-with-increased-timeout
        Scenario:
          Given a passing step
      """
    When I run cucumber-js
    Then it passes


  Scenario: changing hooks timeouts does not effect other hooks
    Given a file named "features/a.feature" with:
      """
      Feature:
        @slow
        @slow-with-increased-timeout
        Scenario:
          Given a passing step
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      function timed out, ensure the callback is executed within 500 milliseconds
      """


  Scenario: hooks can disable timeouts
    Given a file named "features/a.feature" with:
      """
      Feature:
        @disabled
        Scenario:
          Given a passing step
      """
    When I run cucumber-js
    Then it passes

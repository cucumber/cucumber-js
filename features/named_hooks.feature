Feature: Named hooks

  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    Given a file named "features/step_definitions/hooks.js" with:
      """
      const {After, Before} = require('@cucumber/cucumber')

      Before({name: 'hook 1'}, function() {})
      Before({name: 'hook 2'}, function() {})
      After({name: 'hook 3'}, function() {})
      """
    Given a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {})
      """
    When I run cucumber-js
    Then the output contains the text:
    """
    Before "hook 2"
    """

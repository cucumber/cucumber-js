Feature: Named hooks

  As a developer
  I want to name a `Before` or `After` hook
  So that I can easily identify which hooks are run when reporting

  Scenario: Hook is named and then referenced by its name in formatter output
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/hooks.js" with:
      """
      const {After, Before} = require('@cucumber/cucumber')

      Before({name: 'hook 1'}, function() {})
      Before({name: 'hook 2'}, function() {})
      After({name: 'hook 3'}, function() {})
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {
        throw 'nope'
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
    """
    Before (hook 2) #
    """

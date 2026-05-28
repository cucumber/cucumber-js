@spawn
Feature: Paths

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: Feature A
        Scenario: Scenario A
          Given a passing step
      """
    And a file named "features/b.feature" with:
      """
      Feature: Feature B
        Scenario: Scenario B
          Given a passing step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      Given('a passing step', function() {})
      """

  Scenario: paths merged when supplied in both config and CLI
    Given a file named "cucumber.json" with:
      """
      { "default": { "paths": ["features/**/*.feature"] } }
      """
    When I run cucumber-js with `features/a.feature`
    Then it runs 2 scenarios
    And the error output contains the text:
      """
      You have specified paths in both your configuration file and as CLI arguments
      """


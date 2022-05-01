@spawn
Feature: Colors

  As a developer
  I want to control when/whether the output includes colors

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      Given('a step', function() {})
      """
    And a file named "cucumber.json" with:
    """
    { "default": { "format": ["summary:summary.out"] } }
    """

  Scenario: no colored output by default for a file stream
    When I run cucumber-js
    Then the file "summary.out" doesn't contain colors

  Scenario: colored output can be activated with the format option
    When I run cucumber-js with `--format-options '{"colorsEnabled":true}'`
    Then the file "summary.out" contains colors

  Scenario: colored output can be activated with FORCE_COLOR
    When I run cucumber-js with env `FORCE_COLOR=1`
    Then the file "summary.out" contains colors

  Scenario: FORCE_COLOR takes precedence over the format option
    When I run cucumber-js with arguments `--format-options '{"colorsEnabled":false}'` and env `FORCE_COLOR=1`
    Then the file "summary.out" contains colors

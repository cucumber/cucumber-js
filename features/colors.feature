Feature: Colors

  As a developer
  I want to control when/whether the output includes ANSI colors
  So that I can be happy

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

  Scenario: no colored output by default for a file stream
    When I run cucumber-js with `--format summary:summary.out`
    Then it passes
    Then the file "summary.out" doesn't contain ansi colors

  Scenario: colored output can be explicitly activated for a file stream
    When I run cucumber-js with `--format summary:summary.out --format-options '{"colorsEnabled":true}'`
    Then it passes
    Then the file "summary.out" contains ansi colors

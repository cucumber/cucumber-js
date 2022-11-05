@spawn
Feature: debug

  As a Cucumber user
  I want to enable debug logging
  So that I can troubleshoot issues with my project

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given a step passes
          When a step passes
          Then a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step passes$/, function() {});
      """

  Scenario:
    Given my env includes "DEBUG=cucumber"
    When I run cucumber-js
    Then the error output contains the text:
    """
    No configuration file found
    """

  Scenario:
    When I run cucumber-js
    Then the error output does not contain the text:
    """
    No configuration file found
    """

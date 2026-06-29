@spawn
Feature: Exit codes

  Cucumber distinguishes the exit code for a run where scenarios failed
  from a run where Cucumber itself could not be invoked correctly, so that
  CI can tell genuine test failures apart from a broken command.

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a passing step', function() {})
      Given('a failing step', function() { throw new Error('boom') })
      """

  Scenario: exit code 0 when all scenarios pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a passing step
      """
    When I run cucumber-js
    Then it passes

  Scenario: exit code 1 when a scenario fails
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a failing step
      """
    When I run cucumber-js
    Then it fails with exit code 1

  Scenario: exit code 2 when the configuration is invalid
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a passing step
      """
    When I run cucumber-js with `--config doesntexist.js`
    Then it fails with exit code 2

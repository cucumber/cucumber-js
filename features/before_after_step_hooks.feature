@BeforeAfterStep
Feature: Before and After Step Hooks

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('cucumber')
      Given(/^a step$/, function() {})
      """

  Scenario: Failing before step fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      const {BeforeStep} = require('cucumber')
      BeforeStep(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  Scenario: Failing after step fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterStep} = require('cucumber')
      AfterStep(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  @any-tag
  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      const { BeforeStep } = require('cucumber')
      BeforeStep('@any-tag', function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      const { AfterStep } = require('cucumber')
      AfterStep('@any-tag', function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it passes
Feature: Before and After Step Hooks

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        @this-tag
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('cucumber')
      Given(/^a step$/, function() {})
      """

  Scenario: Before and After Hooks work correctly
    Given a file named "features/support/hooks.js" with:
      """
      const {BeforeStep, AfterStep, BeforeAll, AfterAll} = require('cucumber')
      const {expect} = require('chai')

      let counter = 1

      BeforeStep(function() { 
        counter = counter + 1
      })

      AfterStep(function() {
        expect(counter).to.eql(2)
        counter = counter + 1
      })

      AfterAll(function() {
        expect(counter).to.eql(3)
      })
      """
    When I run cucumber-js
    Then it passes

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

  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      const { BeforeStep } = require('cucumber')
      BeforeStep({tags: "@any-tag"}, function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Only run BeforeStep hooks with appropriate tags
    Given a file named "features/support/hooks.js" with:
      """
      const { AfterStep } = require('cucumber')
      AfterStep({tags: "@this-tag"}, function() {
        throw Error("Would fail if ran")
      })
      """
    When I run cucumber-js
    Then it fails

  @AK
  Scenario: after hook parameter can access result status of step
    Given a file named "features/support/hooks.js" with:
      """
      const { BeforeStep, AfterStep, Status } = require('cucumber')

      AfterStep(function({result}) {
        if (result.status === Status.FAILED) {
          console.log('AfterStep Hook ran even through step failed')
        } else {
           console.log('AfterStep Hook ran after step passed')
        }
      })
      """
    When I run cucumber-js
    Then the output contains the text:
      """
      AfterStep Hook ran after step passed
      """

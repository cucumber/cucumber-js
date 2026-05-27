Feature: Environment Hooks

  As a developer with scenarios that share some resource (like a browser)
  I want setup and teardown hooks for the test run

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given first step

        Scenario: second scenario
          Given second step
      """

  Scenario: before all / after all hooks

    BeforeAll hooks run once each before any scenarios, in declaration order
    AfterAll hooks run once each after all scenarios, in reverse declaration order

    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      let counter = 1

      BeforeAll(function() {
        expect(counter).to.eql(1)
        counter += counter
      })

      BeforeAll(function() {
        expect(counter).to.eql(2)
        counter += counter
      })

      Given('first step', function() {
        expect(counter).to.eql(4)
        counter += counter
      })

      Given('second step', function() {
        expect(counter).to.eql(8)
        counter += counter
      })

      AfterAll(function() {
        expect(counter).to.eql(32)
        counter += counter
      })

      AfterAll(function() {
        expect(counter).to.eql(16)
        counter += counter
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Failing before all hook fails the test run
    Given a file named "features/support/hooks.js" with:
      """
      const {BeforeAll} = require('@cucumber/cucumber')

      BeforeAll(function(callback) {
        callback(new Error('my error'))
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      1 hooks (1 failed)
      """
    And the output contains the text:
      """
      Error: my error
      """
    And the output contains the text:
      """
      features/support/hooks.js:4
      """

  Scenario: Failing after all hook fails the test run
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll} = require('@cucumber/cucumber')

      AfterAll(function(callback) {
        callback(new Error('my error'))
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      1 hooks (1 failed)
      """
    And the output contains the text:
      """
      Error: my error
      """
    And the output contains the text:
      """
      features/support/hooks.js:4
      """

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
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import {expect} from 'chai'

      let counter = 1

      defineSupportCode(({AfterAll, BeforeAll, Given}) => {
        BeforeAll(function() {
          expect(counter).to.eql(1)
          counter += counter
        })

        Given('first step', function() {
          expect(counter).to.eql(2)
          counter += counter
        })

        Given('second step', function() {
          expect(counter).to.eql(4)
          counter += counter
        })

        AfterAll(function() {
          expect(counter).to.eql(8)
          counter += counter
        })
      })
      """
    When I run cucumber.js
    Then it passes

  Scenario: Failing before all hook kills the suite
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({BeforeAll}) => {
        BeforeAll(function(callback) {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the error output contains the text snippets:
      | a BeforeAll hook errored, process exiting |
      | Error: my error                           |
      | features/support/hooks.js:4               |

  Scenario: Failing after all hook kills the suite
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({AfterAll}) => {
        AfterAll(function(callback) {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the error output contains the text snippets:
      | an AfterAll hook errored, process exiting |
      | Error: my error                           |
      | features/support/hooks.js:4               |

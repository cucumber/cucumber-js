Feature: Hook Parameters

  Background:
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """

  @spawn
  Scenario: before hook parameter
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When(/^a step$/, function() {})
      })
      """
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Before}) => {
        Before(function(testCase) {
          console.log(testCase.sourceLocation.uri + ":" + testCase.sourceLocation.line)
        })
      })
      """
    When I run cucumber.js
    Then the output contains the text:
      """
      features/my_feature.feature:2
      """

  @spawn
  Scenario: after hook parameter (failing test case)
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When(/^a step$/, function() {})
      })
      """
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode, Status} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(testCase) {
          let message = testCase.sourceLocation.uri + ":" + testCase.sourceLocation.line + " "
          if (testCase.result.status === Status.FAILED) {
            message += "failed"
          } else {
            message += "did not fail"
          }
          console.log(message)
        })
      })
      """
    When I run cucumber.js
    Then the output contains the text:
      """
      features/my_feature.feature:2 did not fail
      """

  @spawn
  Scenario: after hook parameter (failing test case)
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When(/^a step$/, function() {
          throw new Error("my error")
        })
      })
      """
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode, Status} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(testCase) {
          let message = testCase.sourceLocation.uri + ":" + testCase.sourceLocation.line + " "
          if (testCase.result.status === Status.FAILED) {
            message += "failed"
          } else {
            message += "did not fail"
          }
          console.log(message)
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      features/my_feature.feature:2 failed
      """

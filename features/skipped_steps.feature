Feature: Skipped steps

  Using this feature, a scenario can be imperatively 'skipped'.

  For example, skipping in a `Given` step will mark the following steps of the same scenario as skipped.

  There are three methods of skipping. One for synchronous steps, one for an asynchronous callback, and one for an asynchronous promise.

  Background:
    Given a file named "features/skipped.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a skipped step
      """

  Scenario: Synchronous skipped step
    Given a file named "features/step_definitions/skipped_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a skipped step$/, function() {
          return 'skipped'
        })
      })
      """
    When I run cucumber.js
    Then it passes
    And the step "a skipped step" has status "skipped"


  Scenario: Callback skipped step
    Given a file named "features/step_definitions/skipped_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a skipped step$/, function(callback) {
          callback(null, 'skipped')
        })
      })
      """
    When I run cucumber.js
    Then it passes
    And the step "a skipped step" has status "skipped"

  Scenario: Promise skipped step
    Given a file named "features/step_definitions/skipped_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a skipped step$/, function(){
          return {
            then: function(onResolve, onReject) {
              setTimeout(function() {
                onResolve('skipped')
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    Then it passes
    And the step "a skipped step" has status "skipped"

  Scenario: Hook skipped scenario steps
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After, Before}) => {
        Before(function() {return 'skipped'})
      })
      """
    And a file named "features/step_definitions/skipped_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a skipped step$/, function() {
          var a = 1;
        })
      })
      """
    When I run cucumber.js
    Then it passes
    And the step "a skipped step" has status "skipped"

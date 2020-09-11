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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function() {
        return 'skipped'
      })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" step "Given a skipped step" has status "skipped"
    And scenario "a scenario" has status "skipped"


  Scenario: Callback skipped step
    Given a file named "features/step_definitions/skipped_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function(callback) {
        callback(null, 'skipped')
      })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" step "Given a skipped step" has status "skipped"
    And scenario "a scenario" has status "skipped"

  Scenario: Promise skipped step
    Given a file named "features/step_definitions/skipped_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function(){
        return {
          then: function(onResolve, onReject) {
            setTimeout(function() {
              onResolve('skipped')
            })
          }
        }
      })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" step "Given a skipped step" has status "skipped"
    And scenario "a scenario" has status "skipped"

  Scenario: Hook skipped scenario steps
    Given a file named "features/support/hooks.js" with:
      """
      const {After, Before} = require('@cucumber/cucumber')

      Before(function() {return 'skipped'})
      """
    And a file named "features/step_definitions/skipped_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function() {
        var a = 1;
      })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" step "Given a skipped step" has status "skipped"
    And scenario "a scenario" has status "skipped"

  Scenario: Skipped before hook should skip all before hooks
    Given a file named "features/step_definitions/world.js" with:
      """
      const {setWorldConstructor} = require('@cucumber/cucumber')
      setWorldConstructor(function() {
        this.ran = false
      })
      """
    And a file named "features/support/hooks.js" with:
      """
      const assert = require('assert')
      const {After, Before} = require('@cucumber/cucumber')

      Before(function() {return 'skipped'})

      Before(function() { this.ran = true })

      After(function() { assert.equal(this.ran, false) })
      """
    And a file named "features/step_definitions/skipped_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function() {
        var a = 1;
      })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" has status "skipped"

  Scenario: Skipped before hook should run after hook
    Given a file named "features/support/hooks.js" with:
      """
      const {After, Before} = require('@cucumber/cucumber')

      Before(function() {return 'skipped'})

      Before(function() {})

      After(function() {})
      """
    And a file named "features/step_definitions/skipped_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a skipped step$/, function() {
        var a = 1;
       })
      """
    When I run cucumber-js
    Then it passes
    And scenario "a scenario" "After" hook has status "passed"
    And scenario "a scenario" has status "skipped"

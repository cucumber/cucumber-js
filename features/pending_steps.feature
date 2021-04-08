Feature: Pending steps

  Background:
    Given a file named "features/pending.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a pending step
      """

  Scenario: Synchronous pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a pending step$/, function() {
        return 'pending'
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a pending step" has status "pending"


  Scenario: Callback pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a pending step$/, function(callback) {
        callback(null, 'pending')
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a pending step" has status "pending"

  Scenario: Promise pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a pending step$/, function(){
        return {
          then: function(onResolve, onReject) {
            setTimeout(function() {
              onResolve('pending')
            })
          }
        }
      })
      """
    When I run cucumber-js
    Then it fails
    And scenario "a scenario" step "Given a pending step" has status "pending"

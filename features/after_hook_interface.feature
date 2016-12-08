Feature: After hook interface

  Background:
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When(/^a step$/, function() {
          this.value = 1;
        })
      })
      """

  Scenario: too many arguments
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(arg1, arg2, arg3) {})
      })
      """
    When I run cucumber.js
    And the exit status should be 1
    And the output contains the text:
      """
      function has 3 arguments, should have 0 or 1 (if synchronous or returning a promise) or 2 (if accepting a callback)
      """

  Scenario: synchronous
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({After}) => {
        After(function() {
          assert.equal(this.value, 1)
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: synchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function() {
          throw new Error('my error')
        })
      }
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback without error
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({After}) => {
        After(function(scenario, callback) {
          setTimeout(() => {
            assert.equal(this.value, 1);
            callback();
          })
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: callback with error
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(scenario, callback) {
          setTimeout(() => {
            callback(new Error('my error'))
          })
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(scenario, callback) {
          setTimeout(() => {
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback - returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(scenario, callback) {
          return {
            then: function() {}
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 1
    And the output contains the text:
      """
      function uses multiple asynchronous interfaces: callback and promise
      """

  Scenario: promise resolves
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({After}) => {
        After(function() {
          return {
            then: (onResolve, onReject) => {
              setTimeout(() => {
                assert.equal(this.value, 1);
                onResolve()
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        this.After(function(){
          return {
            then: (onResolve, onReject) => {
              setTimeout(() => {
                onReject(new Error('my error'))
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: promise rejects without error
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function() {
          return {
            then: (onResolve, onReject) => {
              setTimeout(onReject)
            }
          }
        })
      })

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({After}) => {
        After(function(){
          return {
            then: (onResolve, onReject) => {
              setTimeout(() => {
                throw new Error('my error')
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 1

Feature: Register Handler

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

      defineSupportCode(({Given}) => {
        Given(/^a step$/, function() {})
      })
      """

  Scenario: synchronous
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {})
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: synchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          throw new Error('my error')
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 my error
      """

  Scenario: callback without error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(callback)
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: callback with error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(function() {
            callback(new Error('my error'))
          })
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 my error
      """

  Scenario: callback asynchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(function(){
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero

  Scenario: callback - returning a promise
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function(features, callback) {
          return {
            then: function() {}
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 function uses multiple asynchronous interfaces: callback and promise
      """

  Scenario: promise resolves
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(resolve)
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: promise rejects with error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(function() {
                reject(new Error('my error'))
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 my error
      """

  Scenario: promise rejects without error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(reject)
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 Promise rejected
      """

  Scenario: promise asynchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(function() {
                throw new Error('my error')
              })
            }
          }
        })
      })
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:4 my error
      """

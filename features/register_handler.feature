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
    Then it passes

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
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Error: my error                    |
      | features/support/handlers.js:4     |

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
    Then it passes

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
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Error: my error                    |
      | features/support/handlers.js:4     |

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
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Error: my error                    |
      | features/support/handlers.js:4     |

  Scenario: callback - returning a promise
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function(features, callback) {
          return Promise.resolve()
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting                                   |
      | function uses multiple asynchronous interfaces: callback and promise |
      | features/support/handlers.js:5                                       |

  Scenario: promise resolves
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return Promise.resolve()
        })
      })
      """
    When I run cucumber.js
    Then it passes

  Scenario: promise rejects with error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return Promise.reject(new Error('my error'))
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Error: my error                    |
      | features/support/handlers.js:5     |

  Scenario: promise rejects without error
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return Promise.reject()
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Promise rejected without a reason  |
      | features/support/handlers.js:5     |

  Scenario: promise asynchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import Promise from 'bluebird'

      defineSupportCode(({registerHandler}) => {
        registerHandler('AfterFeatures', function() {
          return new Promise(function() {
            setTimeout(function() {
              throw new Error('my error')
            })
          })
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text snippets:
      | a handler errored, process exiting |
      | Error: my error                    |
      | features/support/handlers.js:5     |

  Scenario: event handler step match location with support code aliases
    Given a file named "features/support/handlers.js" with:
      """
      let {registerHandler} = require('cucumber')
      registerHandler('AfterFeatures', function(arg1, arg2) {
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      a handler errored, process exiting: features\support\handlers.js:2
      """

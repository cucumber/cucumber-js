Feature: before / after all hook interfaces

  Rules:
  - before / after all hooks can be synchronous, return a promise, or accept a callback

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given first step

        Scenario: second scenario
          Given second step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('first step', function() {})
      Given('second step', function() {})
      """

  Scenario Outline: synchronous
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {})
      """
    When I run cucumber-js
    Then it passes

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: synchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {
        throw new Error('my error')
      })
      """
    When I run cucumber-js
    Then it fails

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: callback without error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(callback) {
        setTimeout(callback)
      })
      """
    When I run cucumber-js
    Then it passes

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: callback with error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(callback) {
        setTimeout(() => {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      my error
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  @spawn
  Scenario Outline: callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(callback) {
        setTimeout(() => {
          throw new Error('my error')
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      my error
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: callback - returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(callback) {
        return Promise.resolve()
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      function uses multiple asynchronous interfaces: callback and promise
      to use the callback interface: do not return a promise
      to use the promise interface: remove the last argument to the function
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: promise resolves
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {
        return Promise.resolve()
      })
      """
    When I run cucumber-js
    Then it passes

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {
        return Promise.reject(new Error('my error'))
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      my error
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: promise rejects without error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {
        return Promise.reject()
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      Promise rejected without a reason
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  @spawn
  Scenario Outline: promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function() {
        return new Promise(function() {
          setTimeout(() => {
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      my error
      """

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

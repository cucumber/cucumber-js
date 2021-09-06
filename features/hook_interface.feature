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
      const {When} = require('@cucumber/cucumber')

      When(/^a step$/, function() {
        this.value = 1;
      })
      """

  Scenario Outline: too many arguments
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(arg1, arg2, arg3) {})
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      function has 3 arguments, should have 0 or 1 (if synchronous or returning a promise) or 2 (if accepting a callback)
      """

    Examples:
      | TYPE   |
      | Before |
      | After  |

  Scenario Outline: synchronous
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')
      const assert = require('assert')

      <TYPE>(function() {})
      """
    When I run cucumber-js
    Then it passes

    Examples:
      | TYPE   |
      | Before |
      | After  |

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
      | TYPE   |
      | Before |
      | After  |

  Scenario Outline: callback without error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')
      const assert = require('assert')

      <TYPE>(function(scenario, callback) {
        setTimeout(callback)
      })
      """
    When I run cucumber-js
    Then it passes

    Examples:
      | TYPE   |
      | Before |
      | After  |

  Scenario Outline: callback with error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(scenario, callback) {
        setTimeout(() => {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber-js
    Then it fails

    Examples:
      | TYPE   |
      | Before |
      | After  |

  @spawn
  Scenario Outline: callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(scenario, callback) {
        setTimeout(() => {
          throw new Error('my error')
        })
      })
      """
    When I run cucumber-js
    Then it fails

    Examples:
      | TYPE   |
      | Before |
      | After  |

  Scenario Outline: callback - returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(scenario, callback) {
        return Promise.resolve()
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      function uses multiple asynchronous interfaces: callback and promise
      to use the callback interface: do not return a promise
      to use the promise interface: remove the last argument to the function
      """

    Examples:
      | TYPE   |
      | Before |
      | After  |

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
      | TYPE   |
      | Before |
      | After  |

  Scenario Outline: promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(){
        return Promise.reject(new Error('my error'))
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      my error
      """

    Examples:
      | TYPE   |
      | Before |
      | After  |

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
    And the output contains the text:
      """
      Promise rejected without a reason
      """

    Examples:
      | TYPE   |
      | Before |
      | After  |

  @spawn
  Scenario Outline: promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      const {<TYPE>} = require('@cucumber/cucumber')

      <TYPE>(function(){
        return new Promise(function() {
          setTimeout(() => {
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      my error
      """

    Examples:
      | TYPE   |
      | Before |
      | After  |

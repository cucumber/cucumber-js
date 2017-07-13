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

  Scenario Outline: too many arguments
    Given a file named "features/support/env.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function(arg1, arg2) {})
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      function has 2 arguments, should have 0 (if synchronous or returning a promise) or 1 (if accepting a callback)
      """

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: synchronous
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function() {})
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: synchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function() {
        throw new Error('my error')
      })
      """
    When I run cucumber.js
    Then it fails

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: callback without error
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function(scenario, callback) {
        setTimeout(callback)
      })
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: callback with error
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function(scenario, callback) {
        setTimeout(() => {
          callback(new Error('my error'))
        })
      })
      """
    When I run cucumber.js
    Then it fails

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  @spawn
  Scenario Outline: callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'

      <TYPE>(function(scenario, callback) {
        setTimeout(() => {
          throw new Error('my error')
        })
      })
      """
    When I run cucumber.js
    Then it fails

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: callback - returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      import {<TYPE>} from 'cucumber'
      import Promise from 'bluebird'

      <TYPE>(function(scenario, callback) {
        return Promise.resolve()
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      function uses multiple asynchronous interfaces: callback and promise
      """

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: promise resolves
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'
      import Promise from 'bluebird'

      <TYPE>(function() {
        return Promise.resolve()
      })
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'
      import Promise from 'bluebird'

      <TYPE>(function(){
        return Promise.reject(new Error('my error'))
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      my error
      """

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  Scenario Outline: promise rejects without error
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'
      import Promise from 'bluebird'

      <TYPE>(function() {
        return Promise.reject()
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      Promise rejected without a reason
      """

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

  @spawn
  Scenario Outline: promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      import {<TYPE>} from 'cucumber'
      import Promise from 'bluebird'

      <TYPE>(function(){
        return new Promise(function() {
          setTimeout(() => {
            throw new Error('my error')
          })
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      my error
      """

    Examples:
      | TYPE             |
      | setBeforeAllHook |
      | setAfterAllHook  |

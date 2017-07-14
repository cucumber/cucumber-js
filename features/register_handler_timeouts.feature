Feature: registerHandler timeouts

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a passing step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function() {});
      })
      """

  Scenario: slow handler timeout
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler, setDefaultTimeout}) => {
        setDefaultTimeout(500)

        registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(callback, 1000)
        })
      })
      """
    When I run cucumber.js
    Then it fails
    And the error output contains the text snippets:
      | a handler errored, process exiting        |
      | function timed out after 500 milliseconds |
      | features/support/handlers.js:6            |

  Scenario: slow handler can increase their timeout
    Given a file named "features/supports/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({registerHandler, setDefaultTimeout}) => {
        setDefaultTimeout(500)

        registerHandler('AfterFeatures', {timeout: 1500}, function(features, callback) {
          setTimeout(callback, 1000)
        })
      })
      """
    When I run cucumber.js
    Then it passes

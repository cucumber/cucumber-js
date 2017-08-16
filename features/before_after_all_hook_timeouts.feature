Feature: before / after all hook timeouts

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

  Scenario Outline: slow handler timeout
    Given a file named "features/support/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({<TYPE>, setDefaultTimeout}) => {
        setDefaultTimeout(500)

        <TYPE>(function(callback) {
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

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

  Scenario Outline: slow handlers can increase their timeout
    Given a file named "features/supports/handlers.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({<TYPE>, setDefaultTimeout}) => {
        setDefaultTimeout(500)

        <TYPE>({timeout: 1500}, function(callback) {
          setTimeout(callback, 1000)
        })
      })
      """
    When I run cucumber.js
    Then it passes

    Examples:
      | TYPE      |
      | BeforeAll |
      | AfterAll  |

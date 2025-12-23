Feature: Plugins

  Background: An ordinary project
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.mjs" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given('a passing step', function() {})
      """

  Scenario: Custom plugin with options is successfully loaded and run
    Given a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator({ options, on, logger }) {
          on('message', (message) => {
            if (message.testRunFinished) {
              logger.info(`Plugin tracked end of test run with bar count of ${options.bar}`)
            }
          })
        },
        optionsKey: 'foo'
      }
      """
    When I run cucumber-js with `--plugin ./my_plugin.mjs --plugin-options '{"foo":{"bar":3}}'`
    Then it passes
    And the error output contains the text:
      """
      Plugin tracked end of test run with bar count of 3
      """

  Scenario: Custom plugin error during init causes Cucumber to fail and is reported to user
    Given a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator() {
          throw new Error('whoops')
        }
      }
      """
    When I run cucumber-js with `--plugin ./my_plugin.mjs`
    Then it fails
    And the error output contains the text:
      """
      Plugin "./my_plugin.mjs" errored when trying to init
      """
    And the error output contains the text:
      """
      whoops
      """

  Scenario: Custom plugin error during event handler causes Cucumber to fail and is reported to user
    Given a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator({ on }) {
          on('message', (message) => {
            throw new Error('whoops')
          })
        }
      }
      """
    When I run cucumber-js with `--plugin ./my_plugin.mjs`
    Then it fails
    And the error output contains the text:
      """
      Plugin "./my_plugin.mjs" errored when trying to handle a "message" event
      """
    And the error output contains the text:
      """
      whoops
      """

  Scenario: Custom plugin error during transform causes Cucumber to fail and is reported to user
    Given a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator({ transform }) {
          transform('pickles:filter', () => {
            throw new Error('whoops')
          })
        }
      }
      """
    When I run cucumber-js with `--plugin ./my_plugin.mjs`
    Then it fails
    And the error output contains the text:
      """
      Plugin "./my_plugin.mjs" errored when trying to do a "pickles:filter" transform
      """
    And the error output contains the text:
      """
      whoops
      """

  Scenario: Custom plugin error during cleanup causes Cucumber to fail and is reported to user
    Given a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator() {
          return () => {
            throw new Error('whoops')
          }
        }
      }
      """
    When I run cucumber-js with `--plugin ./my_plugin.mjs`
    Then it fails
    And the error output contains the text:
      """
      Plugin "./my_plugin.mjs" errored when trying to cleanup
      """
    And the error output contains the text:
      """
      whoops
      """

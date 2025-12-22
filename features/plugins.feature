Feature: Plugins

  Scenario: minimal plugin
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
    And a file named "cucumber.json" with:
      """
      {
        "default": {
          "plugins": ["./my_plugin.mjs"]
        }
      }
      """
    And a file named "my_plugin.mjs" with:
      """
      export default {
        type: 'plugin',
        coordinator({ on, logger }) {
          on('message', (message) => {
            if (message.testRunFinished) {
              logger.info('Plugin tracked end of test run')
            }
          })
        }
      }
      """
    When I run cucumber-js
    Then it passes
    And the error output contains the text:
      """
      Plugin tracked end of test run
      """

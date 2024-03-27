Feature: Invalid installations

  @spawn
  Scenario: Cucumber exits with an error when running an invalid installation
    Given an invalid installation
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a step is passing$/, function() {})
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      You're calling functions (e.g. "When") on an instance of Cucumber that isn't running (status: PENDING).
      This means you may have an invalid installation, potentially due to:
      - Cucumber being installed globally
      - A project structure where your support code is depending on a different instance of Cucumber
      Either way, you'll need to address this in order for Cucumber to work.
      See https://github.com/cucumber/cucumber-js/blob/main/docs/installation.md#invalid-installations
      """

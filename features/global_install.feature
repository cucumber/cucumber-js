Feature: Global Installs

  @spawn @global-install
  Scenario: executing cucumber from a global install error
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
    When I run cucumber-js (installed globally)
    Then it fails
    And the error output contains the text:
      """
      You're calling functions (e.g. "When") on an instance of Cucumber that isn't running.
      This is mostly likely due to:
      - Cucumber being installed globally
      - A project structure where your support code is depending on a different instance of Cucumber
      Either way, you'll need to address this in order for Cucumber to work.
      See https://github.com/cucumber/cucumber-js/blob/main/docs/faq.md
      """
    When I run cucumber-js (installed locally)
    Then it passes

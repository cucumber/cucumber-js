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
      You appear to be executing an install of cucumber (most likely a global install)
      that is different from your local install (the one required in your support files).
      For cucumber to work, you need to execute the same install that is required in your support files.
      Please execute the locally installed version to run your tests.
      """
    When I run cucumber-js (installed locally)
    Then it passes

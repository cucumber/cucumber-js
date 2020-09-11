Feature: Automatically required support files for nested features
  As a developer nesting feature files
  I want the default required files to include any files under the features folder
  So I don't have to do anything special when I start organizing my features

  Scenario:
    Given a directory named "features/nested"
    And a file named "features/nested/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js
    Then it passes

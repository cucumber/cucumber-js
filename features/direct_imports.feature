Feature: Core feature elements execution using direct imports
  In order to have clean syntax for automated acceptance tests
  As a developer
  I want Cucumber to run core feature elements using direct imports

  Scenario: passing
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js
    Then it passes

  Scenario: failing
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step fails
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step fails$/, function(callback) {
        callback(new Error('my error'))
      });
      """
    When I run cucumber-js
    Then it fails
    And scenario "some scenario" step "Given a step fails" failed with:
      """
      my error
      """
    And the output contains the text:
      """
      features/step_definitions/cucumber_steps.js:3
      """

  Scenario: deep imports don't break everything
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const TestCaseHookDefinition = require('@cucumber/cucumber/lib/models/test_case_hook_definition')

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js
    Then it passes

  Scenario: we can import the version number from package.json and from the library
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step checks the version number
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const package_version = require('@cucumber/cucumber/package.json').version
      const library_version = require('@cucumber/cucumber').version

      Given(/^a step checks the version number$/, function() {
        if (package_version !== library_version) {
          throw new Error(`package version: ${package_version} !== library version: ${library_version}`)
        }
      });
      """
    When I run cucumber-js
    Then it passes

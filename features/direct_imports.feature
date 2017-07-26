Feature: Core feature elements execution using direct imports
  In order to have clean syntax for automated acceptance tests
  As a developer
  I want Cucumber to run core feature elements using direct imports

  Scenario: passing
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js
    Then it passes

  Scenario: failing
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given a step fails
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step fails$/, function(callback) {
        callback(new Error('my error'))
      });
      """
    When I run cucumber-js
    Then it fails
    And the step "a step fails" failed with:
      """
      my error
      """
    And the output contains the text:
      """
      features/step_definitions/cucumber_steps.js:3
      """

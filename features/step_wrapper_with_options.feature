Feature: Step Wrapper with Options
  In order to be able to write more complex step definition wrappers
  As a developer
  I want Cucumber to provide the "options" object to the wrapping function

  @spawn
  Scenario: options passed to the step definitions wrapper
    Given a file named "features/a.feature" with:
      """
      Feature: Step with an option
        Scenario: Steps
          When I run a step with options
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^I run a step with options$/, {wrapperOptions: {retry: 2}}, function () {})
      """
    And a file named "features/support/setup.js" with:
      """
      const {setDefinitionFunctionWrapper} = require('@cucumber/cucumber')

      setDefinitionFunctionWrapper(function (fn, options = {}) {
        if (options.retry) {
          console.log("Max retries: ", options.retry);
        }
        return fn;
      })
      """
    When I run cucumber-js
    Then the output contains the text:
      """
      Max retries: 2
      """

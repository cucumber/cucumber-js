Feature: Step Wrapper with Phase
  In order to write step definition wrappers that are aware of the scenario phase
  As a developer
  I want Cucumber to provide a "phase" string to the wrapping function

  @spawn
  Scenario: phase passed to the step definitions wrapper
    Given a file named "features/a.feature" with:
      """
      Feature: Steps with phases
        Scenario: Steps
          Given I run a given step
          When I run a when step
          Then I run a then step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given, When, Then} from 'cucumber'

      Given(/^I run a given step$/, function () {})
      When(/^I run a when step$/, function () {})
      Then(/^I run a then step$/, function () {})
      """
    And a file named "features/support/setup.js" with:
      """
      import {setDefinitionFunctionWrapper} from 'cucumber'

      setDefinitionFunctionWrapper(function (fn, options = {}, phase) {
        console.log("Phase: ", phase);
        return fn;
      })
      """
    When I run cucumber-js
    Then the output contains the text:
      """
      Phase: given
      Phase: when
      Phase: then
      """

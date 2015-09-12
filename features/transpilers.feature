Feature: Transpiler support
  In order to use the JS dialect I'm most comfortable with
  As a step definition implementor
  I want to use other languages for writing step definitions

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """

  Scenario: coffeescript
    Given a file named "features/step_definitions/passing_steps.coffee" with:
      """
      stepDefinitions = ->
        @Given /^a passing step$/, (callback) ->
          callback()

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: pogoscript
    Given a file named "features/step_definitions/passing_steps.pogo" with:
      """
      step definitions () =
        this.define step r/^a passing step$/ @(callback)
          callback()

      module.exports = step definitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

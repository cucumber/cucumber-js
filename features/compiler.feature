Feature: compilers
  In order to use the JS dialect I'm most comfortable with
  As a step definition implementor
  I want to use any compiler to write my step definitions in

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given this step passes
      """


  Scenario: CoffeeScript step definition
    Given a file named "features/step_definitions/cucumber_steps.coffee" with:
      """
      stepDefinitions = ->
        @When /^this step passes$/, (callback) ->
          callback()

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--compiler coffee:coffee-script/register -f progress`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario: Pogoscript step definition
    Given a file named "features/step_definitions/cucumber_steps.pogo" with:
      """
      step definitions () =
        this.When r/^this step passes$/ @(callback)
          callback()

      module.exports = step definitions
      """
    When I run cucumber.js with `--compiler pogo:pogo -f progress`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

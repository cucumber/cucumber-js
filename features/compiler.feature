Feature: compilers
  In order to use the JS dialect I'm most comfortable with
  As a step definition implementor
  I want to use any compiler to write my step definitions in

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a step
      """


  Scenario: CoffeeScript step definition (passing)
    Given a file named "features/step_definitions/cucumber_steps.coffee" with:
      """
      stepDefinitions = ->
        @Given /^a step$/, ->

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


  Scenario: CoffeeScript step definition (failing)
    Given a file named "features/step_definitions/cucumber_steps.coffee" with:
      """
      stepDefinitions = ->
        @Given /^a step$/, -> throw 'fail'

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--compiler coffee:coffee-script/register -f progress`
    Then it outputs this text:
      """
      F

      Failures:

      1) Scenario:  - features/a.feature:2
         Step: Given a step - features/a.feature:3
         Step Definition: features/step_definitions/cucumber_steps.coffee:2
         Message:
           fail

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """

@spawn
Feature: compilers
  In order to use the JS dialect I'm most comfortable with
  As a step definition implementor
  I want to use any compiler to write my step definitions in


  Scenario: CoffeeScript step definition
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    Given a file named "features/step_definitions/cucumber_steps.coffee" with:
      """
      {Given} = require '@cucumber/cucumber'

      Given /^a step$/, ->
      """
    When I run cucumber-js with `--require-module coffeescript/register --require 'features/**/*.coffee'`
    Then scenario "some scenario" step "Given a step" has status "passed"

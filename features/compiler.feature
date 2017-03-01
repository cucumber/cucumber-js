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
      {defineSupportCode} = require 'cucumber'

      defineSupportCode ({Given}) ->
        Given /^a step$/, ->
      """
    When I run cucumber.js with `--compiler coffee:coffee-script/register`
    Then the step "a step" has status "passed"

    Scenario: Typescript step definition
      Given a file named "features/a.feature" with:
        """
        Feature: some feature
          Scenario: some scenario
            Given a step
        """
      Given a file named "features/step_definitions/cucumber_steps.ts" with:
        """
        import {defineSupportCode, ISupportCode} from "cucumber";

        defineSupportCode((support: ISupportCode) => {
            support.Given(/^a step$/, params => {

            } );
        });
        """
      When I run cucumber.js with `--compiler ts:ts-node/register`
      Then the step "a step" has status "passed"

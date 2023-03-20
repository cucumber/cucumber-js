@dev
Feature: ES and CommonJS Error disabiguation

  Import must be used for ES modules, Require for
  CommonJS modules, but when developers cross these up
  cucumber-js needs to throw an understandable error.

  Scenario: ES module invoked with --require
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: one
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js with `--require features/**/*.js`
    Then it fails
    And the error output contains the text:
      """
        Error: Cucumber expected a CommonJS module 
      """

  Scenario: CommonJS module invoked with --import
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: one
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.mjs" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js with `--import features/**/*.mjs`
    Then it fails
    And the error output contains the text:
      """
        Error: Cucumber expected an ES module
      """


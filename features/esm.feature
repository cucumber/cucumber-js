@esm
Feature: ES modules support

  cucumber-js works with native ES modules

  Scenario: native module syntax works in support code, formatters and snippets
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: one
          Given a step passes

        Scenario: two
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    And a file named "custom-formatter.js" with:
      """
      import {SummaryFormatter} from '@cucumber/cucumber'

      export default class CustomFormatter extends SummaryFormatter {}
      """
    And a file named "custom-snippet-syntax.js" with:
      """
      export default class CustomSnippetSyntax {
          build(opts) {
              return 'hello world'
          }
      }
      """
    And a file named "cucumber.cjs" with:
      """
      module.exports = {
        'default': '--format summary'
      }
      """
    When I run cucumber-js with `--import features/**/*.js --format ./custom-formatter.js --format-options '{"snippetSyntax": "./custom-snippet-syntax.js"}'`
    Then it runs 2 scenarios
    And it passes

  Scenario: native modules work with parallel runtime
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: one
          Given a step passes

        Scenario: two
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js with `--import features/**/*.js' --parallel 2`
    Then it runs 2 scenarios
    And it passes

  Scenario: .mjs support code files are discovered automatically if no requires or imports specified
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: one
          Given a step passes

        Scenario: two
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.mjs" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js
    Then it runs 2 scenarios
    And it passes

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

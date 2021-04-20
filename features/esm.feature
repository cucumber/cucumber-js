Feature: ES modules support

  cucumber-js works with native ES modules, via a Cli flag `--esm`

  @esm
  Scenario Outline: native module syntax works when using --esm
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
    And a file named "cucumber.js" with:
      """
      export default {
        'default': '--format message:messages.ndjson',
      }
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
    When I run cucumber-js with `<options> --format ./custom-formatter.js --format-options '{"snippetSyntax": "./custom-snippet-syntax.js"}'`
    Then it passes
    Examples:
      | options            |
      | --esm              |
      | --esm --parallel 2 |

  @esm
  Scenario: .mjs support code files are matched by default when using --esm
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.mjs" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js with `--esm`
    Then it passes

  Scenario: native module syntax doesn't work without --esm
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from '@cucumber/cucumber'

      Given(/^a step passes$/, function() {});
      """
    When I run cucumber-js
    Then it fails
Feature: Set the execution order

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        @a
        Scenario: first scenario
          Given a step

        @b
        Scenario Outline: second scenario - <ID>
          Given a step

          @c
          Examples:
            | ID |
            | X  |
            | Y  |

          @d
          Examples:
            | ID |
            | Z  |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """

  Scenario: run in defined order scenario
    When I run cucumber-js with `--order defined`
    Then it runs the scenarios:
      | NAME                |
      | first scenario      |
      | second scenario - X |
      | second scenario - Y |
      | second scenario - Z |

  Scenario: run in random order with seed
    When I run cucumber-js with `--order random:234119`
    Then it runs the scenarios:
      | NAME                |
      | second scenario - Z |
      | second scenario - X |
      | second scenario - Y |
      | first scenario      |

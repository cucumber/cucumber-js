Feature: Target specific scenarios
  As a developer running features
  I want an easy way to run specific scenarios by tag
  So that I don't waste time running my whole test suite when I don't need to

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
      var cucumberSteps = function() {
        this.When(/^a step is (.*)$/, function() { });
      };
      module.exports = cucumberSteps;
      """

  Scenario: run a single scenario
    When I run cucumber.js with `--tags @a`
    Then it runs the scenario "first scenario"

  Scenario: filter out scenarios with ~
    When I run cucumber.js with `--tags "not @b"`
    Then it runs the scenario "first scenario"

  Scenario: run a single scenario outline
    When I run cucumber.js with `--tags @b`
    Then it runs the scenarios:
      | NAME |
      | second scenario - X |
      | second scenario - Y |
      | second scenario - Z |

  Scenario: run a single scenario outline examples
    When I run cucumber.js with `--tags @c`
    Then it runs the scenarios:
      | NAME |
      | second scenario - X |
      | second scenario - Y |

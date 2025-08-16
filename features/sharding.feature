Feature: Running scenarios using sharding
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
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {})
      """

  Scenario: run a single scenario
    When I run cucumber-js with `--shard 1/5`
    Then it passes
    And it runs the scenario "first scenario"

  Scenario: run every other scenario starting at 1
    When I run cucumber-js with `--shard 1/2`
    Then it passes
    And it runs the scenarios:
      | NAME |
      | first scenario      |
      | second scenario - Y |

  Scenario: run every 3rd scenario starting at 1
    When I run cucumber-js with `--shard 1/3`
    Then it passes
    And it runs the scenarios:
      | NAME |
      | first scenario      |
      | second scenario - Z |

  Scenario: run even scenarios
    When I run cucumber-js with `--shard 2/2`
    Then it passes
    And it runs the scenarios:
      | NAME |
      | second scenario - X |
      | second scenario - Z |

  Scenario: no scenarios in shard
    When I run cucumber-js with `--shard 5/5`
    Then it passes
    And it runs 0 scenarios

  Scenario: invalid shard option
    When I run cucumber-js with `--shard whoops`
    Then it fails
    And the error output contains the text:
    """
    the shard option must be in the format <index>/<total> (e.g. 1/3)
    """


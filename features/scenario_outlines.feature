Feature: Scenario Outlines and Examples

  Scenario: placeholder in step
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a <type> scenario
          Given a <type> step

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber-js
    Then it fails
    And it runs 2 scenarios
    And the scenario "a passing scenario" has the steps:
      | STEP                 |
      | Given a passing step |
    And the scenario "a failing scenario" has the steps:
      | STEP                 |
      | Given a failing step |

  Scenario: placeholder in docstring
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a <type> scenario
          Given a doc string step
            \"\"\"
            a <type> doc string
            \"\"\"

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber-js
    Then it fails
    And it runs 2 scenarios
    And scenario "a passing scenario" step "Given a doc string step" has the doc string:
      """
      a passing doc string
      """
    And scenario "a failing scenario" step "Given a doc string step" has the doc string:
      """
      a failing doc string
      """

  Scenario: placeholder in table
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a <type> scenario
          Given a table step
            | <type> |

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber-js
    Then it fails
    And it runs 2 scenarios
    And scenario "a passing scenario" step "Given a table step" has the data table:
      | passing |
    And scenario "a failing scenario" step "Given a table step" has the data table:
      | failing |

  Scenario: several scenario outlines
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a step <id>

        Examples:
          | id |
          | 1  |
          | 2  |

        Scenario Outline: another scenario
          Given a step <id>

        Examples:
          | id |
          | 3  |
          | 4  |
      """
    When I run cucumber-js
    Then it fails
    And it runs 4 scenarios

  Scenario: scenario outlines with tagged examples
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a step <id>

        @examples @tag
        Examples:
          | id |
          | 1  |
          | 2  |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step {int}', function(int) {})
      """
    When I run cucumber-js with `-f json`
    Then it passes
    And it runs 2 scenarios

  Scenario: scenario outlines with multiple example tables
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a step <id>

        @example @id-1-2
        Examples:
          | id |
          | 1  |
          | 2  |

        @example @id-3-4
        Examples:
          | id |
          | 3  |
          | 4  |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step {int}', function(int) {})
      """
    When I run cucumber-js with `-f json`
    Then it passes
    And it runs 4 scenarios

Feature: Scenario Outlines and Examples

  Scenario: placeholder in step
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a <type> step

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber.js with `-f json`
    Then it runs 2 scenarios
    And the first scenario has the steps
      | STEP           |
      | a passing step |
    And the second scenario has the steps
      | STEP           |
      | a failing step |

  Scenario: placeholder in docstring
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a doc string step
            \"\"\"
            a <type> doc string
            \"\"\"

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber.js with `-f json`
    Then it runs 2 scenarios
    And the first scenario has the step "a doc string step" with the doc string
      """
      a passing doc string
      """
    And the second scenario has the step "a doc string step" with the doc string
      """
      a failing doc string
      """

  Scenario: placeholder in table
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a table step
            | <type> |

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber.js with `-f json`
    Then it runs 2 scenarios
    And the first scenario has the step "a table step" with the table
      | passing |
    And the second scenario has the step "a table step" with the table
      | failing |

  Scenario: placeholder in title
    Given a file named "features/scenario_outline.feature" with:
      """
      Feature: a feature
        Scenario Outline: a <type> scenario
          Given a step

        Examples:
          | type    |
          | passing |
          | failing |
      """
    When I run cucumber.js with `-f json`
    Then it runs 2 scenarios
    And the first scenario has the name "a passing scenario"
    And the second scenario has the name "a failing scenario"

  Scenario: several scenarion outlines
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
    When I run cucumber.js with `-f json`
    Then it runs 4 scenarios

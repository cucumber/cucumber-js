Feature: Background

  Background allows you to add some context to the scenarios in a
  single feature. A Background is much like a scenario containing a
  number of steps. The difference is when it is run. The background is
  run before each of your scenarios but after any of your Before
  Hooks.

  Scenario: One scenario and a background
    Given a file named "features/background.feature" with:
      """
      Feature: a feature
        Background:
          Given a background step

        Scenario: a scenario
          When a scenario step
      """
    When I run cucumber.js
    Then it fails
    And the scenario "a scenario" has the steps
      | IDENTIFIER              |
      | Given a background step |
      | When a scenario step    |

  Scenario: Two scenarios and a background
    Given a file named "features/background.feature" with:
      """
      Feature: a feature
        Background:
          Given a background step

        Scenario: a scenario
          When a scenario step

        Scenario: another scenario
          When another scenario step
      """
    When I run cucumber.js
    Then it fails
    And the scenario "a scenario" has the steps
      | IDENTIFIER              |
      | Given a background step |
      | When a scenario step    |
    And the scenario "another scenario" has the steps
      | IDENTIFIER                 |
      | Given a background step    |
      | When another scenario step |

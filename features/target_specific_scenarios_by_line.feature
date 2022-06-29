Feature: Target specific scenarios
  As a developer running features
  I want an easy way to run specific scenarios by line
  So that I don't waste time running my whole test suite when I don't need to

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given a step

        Scenario Outline: second scenario - <ID>
          Given a step

          Examples:
            | ID |
            | X  |
            | Y  |
      """

  Scenario: run a single scenario
    When I run cucumber-js with `features/a.feature:2`
    Then it fails
    And it runs the scenario "first scenario"

  Scenario: run a single scenario outline
    When I run cucumber-js with `features/a.feature:5`
    Then it fails
    And it runs the scenarios:
      | NAME                |
      | second scenario - X |
      | second scenario - Y |

  Scenario: run a single scenario outline example
    When I run cucumber-js with `features/a.feature:10`
    Then it fails
    And it runs the scenario "second scenario - X"

  Scenario Outline: run multiple scenarios
    When I run cucumber-js with `<args>`
    Then it fails
    And it runs the scenarios:
      | NAME                |
      | first scenario      |
      | second scenario - X |

    Examples:
      | args                                       |
      | features/a.feature:2:10                    |
      | features/a.feature:2 features/a.feature:10 |

  Scenario: using absolute paths
    When I run cucumber-js with `{{{tmpDir}}}/features/a.feature:2`
    Then it fails
    And it runs the scenario "first scenario"

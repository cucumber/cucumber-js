Feature: Scenario Outlines and Examples

  Scenario: Basic outline
    Given the following feature:
      """
      Feature: testing scenarios
        Background:
          Given a background step

        Scenario Outline: outline
          When a <some> step
          Then i get <result>
        Examples:
          | some    | result  |
          | passing | passed  |
          | failing | skipped |
      """
    And the step "a background step" has a passing mapping
    And the step "a passing step" has a passing mapping
    And the step "a failing step" has a failing mapping
    And the step "i get passed" has a passing mapping
    And the step "i get skipped" has a passing mapping
    When Cucumber runs the feature
    Then the scenario called "outline" is reported as failing
    And the step "a background step" passes
    And the step "a passing step" passes
    And the step "a failing step" passes
    And the step "i get passed" passes
    And the step "i get skipped" is skipped

  Scenario: Outline with table
    Given the following feature:
    """
      Feature: testing scenarios
        Scenario Outline: outline
          When a table step:
            | first   | second   |
            | <first> | <second> |
        Examples:
          | first   | second  |
          | 1       | 2       |
      """
    And the step "a table step:" has a passing mapping that receives a data table
    When Cucumber runs the feature
    Then the received data table array equals the following:
      """
      [["first","second"],["1","2"]]
      """

  Scenario: Outline with doc string
    Given the following feature:
    """
      Feature: testing scenarios
        Scenario Outline: outline
          When a doc string step:
            \"\"\"
            I am doc string in <example> example
            And there are <string> string
            \"\"\"
        Examples:
          | example | string |
          | first   | some   |
      """
    And the step "a doc string step:" has a passing mapping that receives a doc string
    When Cucumber runs the feature
    Then the received doc string equals the following:
    """
    I am doc string in first example
    And there are some string
    """   
    
    Scenario Outline: outline
      When a <some> step
      Then i get <result>
    Examples:
      | some    | result  |
      | passing | passed  |
      | failing | skipped |
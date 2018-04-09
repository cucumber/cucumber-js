Feature: Ambiguous Steps

  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
          Parse Error
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      Parse error in 'features/a.feature'
      """

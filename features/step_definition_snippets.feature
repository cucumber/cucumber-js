Feature: step definition snippets

  Scenario: numbers
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step numbered 5
      """
    When I run cucumber-js
    Then it fails
    And it suggests a "Given" step definition snippet with 1 parameter for:
      """
      'a step numbered {arg1:int}'
      """

  Scenario: quoted strings
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step with "quotes"
      """
    When I run cucumber-js
    Then it fails
    And it suggests a "Given" step definition snippet with 1 parameter for:
      """
      'a step with {arg1:stringInDoubleQuotes}'
      """

  Scenario: multiple quoted strings
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step with "quotes" and "more quotes"
      """
    When I run cucumber-js
    Then it fails
    And it suggests a "Given" step definition snippet with 2 parameters for:
      """
      'a step with {arg1:stringInDoubleQuotes} and {arg2:stringInDoubleQuotes}'
      """

  Scenario: background step
    Given a file named "features/background.feature" with:
      """
      Feature: a feature
        Background:
          Given a step with "quotes"
        Scenario: a scenario
          Given a passing step
      """
    When I run cucumber-js
    Then it fails
    And it suggests a "Given" step definition snippet with 1 parameter for:
      """
      'a step with {arg1:stringInDoubleQuotes}'
      """

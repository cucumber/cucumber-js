Feature: Asynchronous failing steps

  Scenario: see asynchronously failing scenarios
    Given the following feature:
      """
      Feature: a feature
        Scenario: a failing scenario
          When I divide 10 by 0
          Then the result is 9
      """
    And the step "I divide 10 by 0" has a mapping asynchronously failing with the message "Divide by 0, uh?"
    When Cucumber runs the feature
    Then the scenario called "a failing scenario" is reported as failing

  @untestable-on-self
  Scenario: see asynchronously failing scenarios with exception
    Given the following feature:
      """
      Feature: a feature
        Scenario: a failing scenario
          When I divide 10 by 0
          Then the result is 9
      """
    And the step "I divide 10 by 0" has a mapping asynchronously failing through an exception with the message "Divide by 0, uh?"
    When Cucumber runs the feature
    Then the scenario called "a failing scenario" is reported as failing

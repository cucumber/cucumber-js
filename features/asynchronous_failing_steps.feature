Feature: Asynchronous failing steps

  Scenario: see failing asynchronous scenarios
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

Feature: Step definition callbacks

  Scenario: fail with single-parameter error (Node.js style)
    Given a scenario with:
      """
      When I divide 10 by 0
      """
    And the step "I divide 10 by 0" has a mapping failing via a Node-like error construct
    When Cucumber executes the scenario
    Then the scenario fails

  Scenario: succeed with promise
    Given a promise-based mapping
    When Cucumber executes that mapping
    Then the mapping is run
    And the scenario passes

  Scenario: fail with promise
    Given a failing promise-based mapping
    When Cucumber executes that mapping
    Then the mapping is run
    And the scenario fails

  Scenario: succeed synchronously
    Given a passing synchronous mapping
    When Cucumber executes that mapping
    Then the mapping is run
    And the scenario passes

  Scenario: succeed with promise if implicit parameters
    Given a promise-based mapping with implicit parameters
    When Cucumber executes a scenario that passes arguments to that mapping
    Then the mapping is run
    And the scenario passes

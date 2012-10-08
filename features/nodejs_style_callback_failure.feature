Feature: Node.js-like callback failures

  Scenario: fail with single-parameter error
    Given a scenario with:
      """
      When I divide 10 by 0
      """
    And the step "I divide 10 by 0" has a mapping failing via a Node-like error construct
    When Cucumber executes the scenario
    Then the scenario fails

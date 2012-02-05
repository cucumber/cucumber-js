Feature: Asynchronous pending steps

  Scenario: Pending step means the scenario is pending
    Given a scenario with:
      """
      When I add 4 and 5
      Then the result is 9
      """
    And the step "I add 4 and 5" has an asynchronous pending mapping
    And the step "the result is 9" has a passing mapping
    When Cucumber executes the scenario
    Then the scenario is pending
    And the step "the result is 9" is skipped

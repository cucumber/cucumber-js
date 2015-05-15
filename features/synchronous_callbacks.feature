Feature: Synchronous callbacks

  Scenario: calling back synchronously from a step definition
    Given a scenario calling a synchronous step definition
    When Cucumber executes the scenario
    Then the scenario passes

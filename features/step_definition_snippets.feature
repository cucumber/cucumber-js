Feature: step definition snippets

  Scenario: outline steps with examples
    Given a scenario with:
      """
      Given I have <some> cucumbers
      """
    When Cucumber executes the scenario
    Then a "Given" step definition snippet for /^I have (.*) cucumbers$/ with 1 parameter is suggested

Feature: Asynchronous step definition callbacks
  In order to test asynchronous code
  As a dev
  I want step definitions to call back asynchronously

  Scenario: Execute feature with asynchronous step definition
    Given a step definition matching /^an asynchronous step passes$/ calling back asynchronously after 50 milliseconds
    And a step definition matching /^a step passes$/
    When I run the following feature:
      """
      Feature: Asynchronous step definition body
        Scenario: Waiting for an asynchronous step to call back
          When an asynchronous step passes
          Then a step passes
      """
    Then the feature should have run successfully

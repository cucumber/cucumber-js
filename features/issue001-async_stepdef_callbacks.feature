Feature: Asynchronous step definition callbacks
  In order to test asynchronous code
  As a dev
  I want step definitions to call back asynchronously

  Scenario: Execute feature with asynchronous step definition
    Given an asynchronous step definition
    When I run a feature using the step definition
    Then the feature should have run successfully

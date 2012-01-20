Feature: World constructor callback
  A callback is passed to World constructors. It is expected to be called
  with the fresh World instance passed as its only parameter.

  Scenario: error on missing World instance
    Given a custom World constructor calling back without an instance
    When Cucumber executes a scenario
    Then an error about the missing World instance is raised

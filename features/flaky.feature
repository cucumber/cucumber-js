Feature: Flaky

  Scenario: Flaky Scenario
    When I run a flaky test
    Then the the flaky step may fail

  Scenario: Non Flaky Scenario
    When I run a flaky test

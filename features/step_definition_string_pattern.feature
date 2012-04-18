Feature: step definitions with string pattern
  Some people don't like Regexps as step definition patterns.
  Cucumber also supports string-based patterns.

  Scenario: step definition with string-based pattern
    Given a mapping with a string-based pattern
    When Cucumber executes a scenario using that mapping
    Then the feature passes
    And the mapping is run

  Scenario: step definition with string-based pattern and parameters
    Given a mapping with a string-based pattern and parameters
    When Cucumber executes a scenario that passes arguments to that mapping
    Then the feature passes
    And the mapping is run
    And the mapping receives the arguments

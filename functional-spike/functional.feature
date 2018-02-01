Feature: some feature

  Scenario: multiplication
    Given my number is 21
    When my number is multiplied by 2
    Then my number should be 42
    And my number should not be 41

  Scenario: multiplication 2
    Given my number is 21
    When my number is multiplied by 3
    Then my number should be 63
    And my number should not be 42

  Scenario: modulo
    Given my number is 21
    When my number is divided by 2
    Then my number should be 11
    And my remainder should be 1

  Scenario: parameter types
    Given Joe is around
    Then Joe should be around

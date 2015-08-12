Feature: PogoScript support
  In order to use the JS dialect that totally rocks
  As a step definition implementor
  I want to use PogoScript for writing step definitions

  Scenario: PogoScript step definition
    Given a mapping written in PogoScript
    When Cucumber executes a scenario using that mapping
    Then the feature passes
    And the mapping is run

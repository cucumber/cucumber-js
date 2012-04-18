Feature: CoffeeScript support
  In order to use the JS dialect I'm most comfortable with
  As a step definition implementor
  I want to use CoffeeScript for writing step definitions

  Scenario: CoffeeScript step definition
    Given a mapping written in CoffeeScript
    When Cucumber executes a scenario using that mapping
    Then the feature passes
    And the mapping is run

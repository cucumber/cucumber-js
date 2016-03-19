Feature: Target specific scenarios
  As a developer running features
  I want an easy way to run specific scenarios by name
  So that I don't waste time running my whole test suite when I don't need to

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: my topic
          When a step is passing

        Scenario: other topic 1
          When a step is passing

        Scenario: other topic 2
          When a step is passing
      """

  Scenario: run a scenario by name
    When I run cucumber.js with `--format json --name my`
    Then it runs the scenario "my topic"

  Scenario: run multiple scenarios by name
    When I run cucumber.js with `--format json --name other`
    Then it runs the scenarios "other topic 1" and "other topic 2"

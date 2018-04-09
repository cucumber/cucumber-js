Feature: Gherkin parse failure

  As a developer writing features with a gherkin parse error
  I want an error message that points me to the file
  So that I can quickly fix the issue and move on

  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
          Parse Error
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      Parse error in 'features/a.feature'
      """

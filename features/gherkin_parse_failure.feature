Feature: Gherkin parse failure

  As a developer writing features with a gherkin parse error
  I want an error message that points me to the file
  So that I can quickly fix the issue and move on

  Scenario: URI, line and column are called out in output
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
      Parse error in "features/a.feature" (4:5)
      """

  Scenario: All parseable sources and all parse errors are emitted
    Given a file named "features/a.feature" with:
      """
      Parse Error
      """
    Given a file named "features/b.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    Given a file named "features/c.feature" with:
      """
      Parse Error
      """
    When I run cucumber-js with `--format message`
    Then it fails
    And the output contains these types and quantities of message:
      | TYPE            | COUNT |
      | source          | 3     |
      | gherkinDocument | 1     |
      | pickle          | 1     |
      | parseError      | 2     |

  Scenario: Formatters handle the truncated test run
    Given a file named "features/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
          Parse Error
      """
    When I run cucumber-js with all formatters
    Then it fails

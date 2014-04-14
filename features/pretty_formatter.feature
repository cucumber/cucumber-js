Feature: Pretty Formatter
 In order to display an easily readable output for humans,
 Developers can use the pretty formatter.

  Scenario: output for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run `cucumber.js -f pretty`
    Then it should pass with:
      """
      Feature: some feature
      """

  Scenario: output for a feature with one undefined scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      Scenario: I haven't done anything yet
      """
    When I run `cucumber.js -f pretty`
    Then it should pass with:
      """
      Feature: some feature
        Scenario: I haven't done anything yet
      """
      
  Scenario: output when debug level at least 3 should show file sources
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      Scenario: I haven't done anything yet
          Given I have not defined this step
      """
    When I run `cucumber.js -f pretty` with "DEBUG_LEVEL" set to "3"
    Then it should pass with:
      """
      Feature: some feature
        Scenario: I haven't done anything yet   # features\a.feature:2
          Given I have not defined this step    # features\a.feature:3
      """
      
  Scenario: output when debug level is less than 3 should not show file sources
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      Scenario: I haven't done anything yet
          Given I have not defined this step
      """
    When I run `cucumber.js -f pretty` with "DEBUG_LEVEL" set to "1"
    Then it should pass with:
      """
      Feature: some feature
        Scenario: I haven't done anything yet
          Given I have not defined this step
      """
      
      
  
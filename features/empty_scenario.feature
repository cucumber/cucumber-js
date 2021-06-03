Feature: Handling of empty scenarios

  Users may have a `Scenario` in their feature with no steps, as a sort of placeholder for what to work on next.
  The exact treatment of these is under discussion in <https://github.com/cucumber/common/issues/249>

  Scenario: running with an empty scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        @foo
        Scenario: some scenario
          Given a passing step

        @foo
        Scenario: haven't done this yet!

        @foo
        Scenario: this one either!
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      """
    When I run cucumber-js with `--dry-run --tags @foo`
    Then it passes

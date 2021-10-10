Feature: Dryrun mode

  Using the `--dry-run` or `-d` flag gives you a way to quickly scan your features without actually running them.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some scenario
        Scenario: some scenario
          Given a step
      """

  Scenario: default behavior
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {})
      """
    When I run cucumber-js with `--dry-run`
    And it passes
    Then scenario "some scenario" step "Given a step" has status "skipped"
    And scenario "some scenario" has status "skipped"

  Scenario: ambiguous step
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {});
      Given('a(n) step', function() {});
      """
    When I run cucumber-js with `--dry-run`
    Then it passes
    And scenario "some scenario" step "Given a step" has status "ambiguous"

  Scenario: pending step

    Since steps aren't actually executed in dry run, a step that would resolve to pending
    will still show up as skipped.

    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {
        return 'pending';
      });
      """
    When I run cucumber-js with `--dry-run`
    Then it passes
    And scenario "some scenario" step "Given a step" has status "skipped"

  Scenario: undefined step
    When I run cucumber-js with `--dry-run`
    Then it passes
    And scenario "some scenario" step "Given a step" has status "undefined"

  Scenario: hooks should not execute in dry run, serial runtime
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    const {BeforeAll, Before, After, AfterAll, Given} = require('@cucumber/cucumber')

    Before(function() {throw 'shouldnt run Before'})
    After(function() {throw 'shouldnt run After'})

    BeforeAll(function() {throw 'shouldnt run BeforeAll'})
    AfterAll(function() {throw 'shouldnt run AfterAll'})

    Given('a step', function() {})
    """
    When I run cucumber-js with `--dry-run`
    Then it passes

  @spawn
  Scenario: hooks should not execute in dry run, parallel runtime
    Given a file named "features/step_definitions/cucumber_steps.js" with:
    """
    const {BeforeAll, Before, After, AfterAll, Given} = require('@cucumber/cucumber')

    Before(function() {throw 'shouldnt run Before'})
    After(function() {throw 'shouldnt run After'})

    BeforeAll(function() {throw 'shouldnt run BeforeAll'})
    AfterAll(function() {throw 'shouldnt run AfterAll'})

    Given('a step', function() {})
    """
    When I run cucumber-js with `--dry-run --parallel 2`
    Then it passes

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
      import {Given} from 'cucumber'

      Given('a step', function() {})
      """
    When I run cucumber-js with `--dry-run`
    Then scenario "some scenario" step "Given a step" has status "skipped"
    And scenario "some scenario" has status "skipped"

  Scenario: ambiguous step
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given('a step', function() {});
      Given('a(n) step', function() {});
      """
    When I run cucumber-js with `--dry-run`
    Then it fails
    And scenario "some scenario" step "Given a step" has status "ambiguous"

  Scenario: undefined step
    When I run cucumber-js with `--dry-run`
    Then it fails
    And scenario "some scenario" step "Given a step" has status "undefined"

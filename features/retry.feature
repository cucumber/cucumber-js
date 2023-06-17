Feature: Retry flaky tests

  Using the `--retry` flag will retry failing tests for the specified number of times
  Additionally using the `--retry-tag-filter` flag will re-run only tests matching the tag expression

  @spawn
  Scenario: running Cucumber JS with --retry-tag-filter but no positive --retry will fail
    When I run cucumber-js with `--retry-tag-filter @flaky`
    Then the error output contains the text:
      """
      Error: a positive `retry` count must be specified when setting `retryTagFilter`
      """
    And it fails

  Scenario: running Cucumber JS with negative --retry will fail
    When I run cucumber-js with `--retry -1`
    Then the error output contains the text:
      """
      Error: --retry must be a non negative integer
      """
    And it fails

  Scenario: running Cucumber JS with --retry 0 will let a failing test fail and not retry
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js with `--retry 0`
    Then scenario "Failing" step "Given a failing step" failed with:
      """
      fail
      """
    And it fails

  Scenario: running Cucumber JS without --retry will let a failing test fail and not retry
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js
    Then scenario "Failing" step "Given a failing step" failed with:
      """
      fail
      """
    And it fails

  Scenario: retrying a flaky test will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1`
    Then it outputs the text:
      """
      F.

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
         ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
             fail

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And it passes

  Scenario: retrying a flaky test will eventually make it pass (parallel)
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --parallel 2`
    Then it outputs the text:
      """
      F.

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
         ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
             fail

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And it passes

  Scenario: Out of two tests one is a flaky test (containing only one flaky step), retrying will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
        Scenario: Good
          Given a good step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      Given(/^a good step$/, function() {
          return
      })
      """
    When I run cucumber-js with `--retry 1`
    Then the output contains the text:
      """
      F..

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
         ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
            fail

      2 scenarios (2 passed)
      2 steps (2 passed)
      <duration-stat>
      """
    And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And scenario "Good" step "Given a good step" has status "passed"
    And it passes

  Scenario: Out of two tests one test has one flaky step, retrying will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
          And a good step
        Scenario: Good
          Given a good step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      Given(/^a good step$/, function() {
          return
      })
      """
    When I run cucumber-js with `--retry 1`
    Then it outputs the text:
      """
      F-...

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
         ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
             fail
         - And a good step # features/step_definitions/cucumber_steps.js:13

      2 scenarios (2 passed)
      3 steps (3 passed)
      <duration-stat>
      """
    And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And it passes

  Scenario: Out of three tests one passes, one is flaky and one fails, retrying the flaky test will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
        Scenario: Good
          Given a good step
        Scenario: Bad
          Given a bad step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      Given(/^a good step$/, function() {
          return
      })

      Given(/^a bad step$/, function() {
          throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1`
    Then it outputs the text:
      """
      F..FF

      Failures:

      1) Scenario: Bad (attempt 2) # features/a.feature:6
         ✖ Given a bad step # features/step_definitions/cucumber_steps.js:17
             fail

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
         ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
             fail

      2) Scenario: Bad (attempt 1, retried) # features/a.feature:6
         ✖ Given a bad step # features/step_definitions/cucumber_steps.js:17
             fail

      3 scenarios (1 failed, 2 passed)
      3 steps (1 failed, 2 passed)
      <duration-stat>
      """
    And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And scenario "Bad" step "Given a bad step" has status "failed"
    And it fails

  Scenario: retrying a genuinely failing test won't make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js with `--retry 1`
    Then scenario "Failing" attempt 0 step "Given a failing step" failed with:
      """
      fail
      """
    And scenario "Failing" attempt 1 step "Given a failing step" failed with:
      """
      fail
      """
    And it fails

  Scenario: retrying a flaky test matching --retry-tag-filter will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retry-tag-filter '@flaky'`
    Then scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    Then scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And it passes

  Scenario: a flaky test not matching --retry-tag-filter won't re-run and just fail
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retry-tag-filter '@not_flaky'`
    Then scenario "Flaky" step "Given a flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test matching --retry-tag-filter will eventually make it pass but not-matching will not be retried (AND operator between tags)
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky @anOtherTag @oneMoreTag
        Scenario: Flaky
          Given a flaky step
        @flaky @oneMoreTag
        Scenario: Also Flaky
          Given an other flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      let willPass2 = false

      Given(/^an other flaky step$/, function() {
        if (willPass2) {
          return
        }
        willPass2 = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retry-tag-filter '@flaky and @anOtherTag'`
    Then scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    Then scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And scenario "Also Flaky" step "Given an other flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test matching --retry-tag-filter will eventually make it pass but not-matching will not be retried (OR operator between tags)
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky @anOtherTag @oneMoreTag
        Scenario: Flaky
          Given a flaky step
        @flaky @oneMoreTag
        Scenario: Also Flaky
          Given an other flaky step
        @flaky
        Scenario: Third Flaky
          Given one more flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      let willPass2 = false

      Given(/^an other flaky step$/, function() {
        if (willPass2) {
          return
        }
        willPass2 = true
        throw 'fail'
      })

      let willPass3 = false

      Given(/^one more flaky step$/, function() {
        if (willPass3) {
          return
        }
        willPass3 = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retry-tag-filter '@anOtherTag or @oneMoreTag'`
    Then scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
    And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
    And scenario "Also Flaky" attempt 0 step "Given an other flaky step" has status "failed"
    And scenario "Also Flaky" attempt 1 step "Given an other flaky step" has status "passed"
    And scenario "Third Flaky" step "Given one more flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test will use a fresh World instance
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Before, After, Given, setWorldConstructor} = require('@cucumber/cucumber')

      Before(function() {
        this.usedCount++
      })

      After(function() {
        if (this.usedCount > 1) {
          throw 'World was used in more than 1 test case run'
        }
      })

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      class CustomWorld {
        constructor() {
          this.usedCount = 0
        }
      }

      setWorldConstructor(CustomWorld)
      """
    When I run cucumber-js with `--retry 1`
    Then it passes

  Rule: using retry in combination with fail-fast will exhaust retries before failing test run

    Scenario: a flaky scenario that passes on the second attempt, set to fail fast
      Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step

        Scenario: Passing
          Given a passing step
      """
      And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })

      Given(/^a passing step$/, function() {})
      """
      When I run cucumber-js with `--retry 1 --fail-fast`
      Then it passes
      And scenario "Flaky" attempt 0 step "Given a flaky step" has status "failed"
      And scenario "Flaky" attempt 1 step "Given a flaky step" has status "passed"
      And scenario "Passing" step "Given a passing step" has status "passed"

    Scenario: a scenario that fails every allotted attempt, set to fail fast
      Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step

        Scenario: Passing
          Given a passing step
      """
      And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a failing step$/, function() { throw 'fail' })
      Given(/^a passing step$/, function() {})
      """
      When I run cucumber-js with `--retry 1 --fail-fast`
      Then it fails
      And scenario "Failing" attempt 0 step "Given a failing step" has status "failed"
      And scenario "Failing" attempt 1 step "Given a failing step" has status "failed"
      And scenario "Passing" step "Given a passing step" has status "skipped"

  Scenario: RerunFormatter does not report attempts that are retried
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      let attemptCountdown = 2

      Given(/^a flaky step$/, function() {
        if (attemptCountdown == 0) {
          return
        }
        attemptCountdown = attemptCountdown - 1
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --format rerun`
    Then it outputs the text:
      """
       features/a.feature:2
      """
    And it fails

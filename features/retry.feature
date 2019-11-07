Feature: Retry flaky tests

  Using the `--retry` flag will retry failing tests for the specified number of times
  Additionally using the `--retryTagFilter` flag will re-run only tests matching the tag expression

  @spawn
  Scenario: running Cucumber JS with --retryTagFilter but no positive --retry will fail
    When I run cucumber-js with `--retryTagFilter @flaky`
    Then the error output contains the text:
      """
      Error: a positive --retry count must be specified when setting --retryTagFilter
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js with `--retry 0`
    Then the output contains the text:
      """
      F

      Failures:

      1) Scenario: Failing # features/a.feature:2
      ✖ Given a failing step # features/step_definitions/cucumber_steps.js:3
      Error: fail
      """
    And scenario "Failing" step "Given a failing step" failed with:
      """
      Error: fail
      """
    And it fails

  Scenario: running Cucumber JS without --retry will let a failing test fail and not retry
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js
    Then the output contains the text:
      """
      F

      Failures:

      1) Scenario: Failing # features/a.feature:2
      ✖ Given a failing step # features/step_definitions/cucumber_steps.js:3
      Error: fail
      """
    And scenario "Failing" step "Given a failing step" failed with:
      """
      Error: fail
      """
    And it fails

  Scenario: retrying a flaky test will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
    Then the output contains the text:
      """
      F.

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
      ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
      """
    And the output contains the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      """
    And scenario "Flaky" step "Given a flaky step" has status "passed"
    And it passes

  Scenario: retrying a flaky test will eventually make it pass (parallel)
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
    Then the output contains the text:
      """
      F.

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
      ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
      """
    And the output contains the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      """
    And scenario "Flaky" step "Given a flaky step" has status "passed"
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
      """
    And the output contains the text:
      """
      2 scenarios (2 passed)
      2 steps (2 passed)
      <duration-stat>
      """
    And scenario "Flaky" step "Given a flaky step" has status "passed"
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
      F-...

      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
      ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
          Error: fail
      """
    And the output contains the text:
      """
      2 scenarios (2 passed)
      3 steps (3 passed)
      <duration-stat>
      """
    And scenario "Flaky" step "Given a flaky step" has status "passed"
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
    Then the output contains the text:
      """
      F..FF

      Failures:

      1) Scenario: Bad (attempt 2) # features/a.feature:6
        ✖ Given a bad step # features/step_definitions/cucumber_steps.js:17
          Error: fail
      """
    And the output contains the text:
      """
      Warnings:

      1) Scenario: Flaky (attempt 1, retried) # features/a.feature:2
          ✖ Given a flaky step # features/step_definitions/cucumber_steps.js:5
              Error: fail
      """
    And the output contains the text:
      """
      2) Scenario: Bad (attempt 1, retried) # features/a.feature:6
          ✖ Given a bad step # features/step_definitions/cucumber_steps.js:17
              Error: fail
      """
    And the output contains the text:
      """
      3 scenarios (1 failed, 2 passed)
      3 steps (1 failed, 2 passed)
      <duration-stat>
      """
    And scenario "Flaky" step "Given a flaky step" has status "passed"
    And scenario "Bad" step "Given a bad step" has status "failed"
    And it fails

  Scenario: retrying a genuinely failing test won't make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a failing step$/, function() { throw 'fail' })
      """
    When I run cucumber-js with `--retry 1`
    Then the output contains the text:
      """
      FF

      Failures:

      1) Scenario: Failing (attempt 2) # features/a.feature:2
      ✖ Given a failing step # features/step_definitions/cucumber_steps.js:3
      Error: fail
      """
    And scenario "Failing" step "Given a failing step" failed with:
      """
      Error: fail
      """
    And it fails

  Scenario: retrying a flaky test matching --retryTagFilter will eventually make it pass
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky
        Scenario: Flaky
          Given a flaky step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retryTagFilter '@flaky'`
    Then scenario "Flaky" step "Given a flaky step" has status "passed"
    And it passes

  Scenario: a flaky test not matching --retryTagFilter won't re-run and just fail
    Given a file named "features/a.feature" with:
      """
      Feature:
        @flaky
        Scenario: Flaky
          Given a flaky step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      let willPass = false

      Given(/^a flaky step$/, function() {
        if (willPass) {
          return
        }
        willPass = true
        throw 'fail'
      })
      """
    When I run cucumber-js with `--retry 1 --retryTagFilter '@not_flaky'`
    Then scenario "Flaky" step "Given a flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test matching --retryTagFilter will eventually make it pass but not-matching will not be retried (AND operator between tags)
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
    When I run cucumber-js with `--retry 1 --retryTagFilter '@flaky and @anOtherTag'`
    Then scenario "Flaky" step "Given a flaky step" has status "passed"
    And scenario "Also Flaky" step "Given an other flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test matching --retryTagFilter will eventually make it pass but not-matching will not be retried (OR operator between tags)
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
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

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
    When I run cucumber-js with `--retry 1 --retryTagFilter '@anOtherTag or @oneMoreTag'`
    Then scenario "Flaky" step "Given a flaky step" has status "passed"
    And scenario "Also Flaky" step "Given an other flaky step" has status "passed"
    And scenario "Third Flaky" step "Given one more flaky step" has status "failed"
    And it fails

  Scenario: retrying a flaky test will use a fresh World instance
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Flaky
          Given a flaky step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Before, After, Given, setWorldConstructor} from 'cucumber'

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

Feature: Retry flaky tests

  Using the `--retry` flag will retry failing tests for the specified number of times
  Additionally using the `--retryTagFilter` flag will re-run only tests matching the tag expression

  @spawn
  Scenario: running Cucumber JS with --retryTagFilter but no positive --retry will fail
    When I run cucumber-js with `--retryTagFilter @flaky`
    Then it fails  

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
    Then the step "a flaky step" has status "passed"
    And it passes

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
    Then the step "a failing step" has status "failed"
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
    Then the step "a flaky step" has status "passed"
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
    Then the step "a flaky step" has status "failed"
    And it fails

Feature: Running scenarios in parallel

  Scenario: running in parallel can improve speed if there are async operations
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a slow step$/, function(callback) {
        setTimeout(callback, 1000)
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: slow
        Scenario: a
          Given a slow step

        Scenario: b
          Given a slow step
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes

  @spawn
  Scenario: an error in BeforeAll fails the test
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {BeforeAll, Given} = require('@cucumber/cucumber')

      Given(/^a slow step$/, function(callback) {
        setTimeout(callback, 1000)
      })

      BeforeAll(function() {
        throw new Error('my error')
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: slow
        Scenario: a
          Given a slow step
      """
    When I run cucumber-js with `--parallel 2`
    And the error output contains the text:
      """
      BeforeAll hook errored on worker 0, process exiting:
      """
    And the error output contains the text:
      """
      BeforeAll hook errored on worker 1, process exiting:
      """
    And the error output contains the text:
      """
      my error
      """
    Then it fails

  Scenario: `testCaseStarted` envelope from workers contains `workerId` parameter
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a slow step$/, function(callback) {
        setTimeout(callback, 1000)
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: slow
        Scenario: a
          Given a slow step

        Scenario: b
          Given a slow step
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And `testCaseStarted` envelope has `workerId`

  Scenario: running in parallel respects `parallelCanAssign` rules on retried scenarios
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {When, setParallelCanAssign} = require('@cucumber/cucumber')

      When(/^I wait slowly$/, function(callback) {
        setTimeout(callback, 200 * 2)
      })
      
      When(/^I wait quickly$/, function(callback) {
        setTimeout(callback, 200 * 1)
      })

      let counter = 0;
      When(/^I fail and have to retry$/, function() {
        counter += 1;
        if (counter < 4) {
          throw new Error('Failed as expected')
        }
      })

      setParallelCanAssign(function(pickleInQuestion, picklesInProgress) {
        const runningCount = picklesInProgress.length;
        const picklesInProgressAllInParallel = picklesInProgress.every(p => p.tags.find(t => t.name === '@parallel') !== undefined);
        const shouldRunInParallel = pickleInQuestion.tags.find((t) => t.name === '@parallel') !== undefined;

        return ((!shouldRunInParallel && runningCount < 1) || shouldRunInParallel) && picklesInProgressAllInParallel;
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: Testing parallelism with retries
        @parallel
        Scenario: fail_parallel
          When I wait quickly
          And I fail and have to retry

        @parallel
        Scenario: pass_parallel
          When I wait slowly
        
        Scenario: pass_sync
          When I wait quickly
      """
    When I run cucumber-js with `--parallel 2 --retry 3`
    Then it passes
    And the first two scenarios run in parallel while the last runs sequentially
    And the scenario 'fail_parallel' retried 3 times

  Scenario: environment variables are passed to parallel workers
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given('I check the environment variable', function() {
        assert.strictEqual(process.env.MY_CUSTOM_VAR, 'my_custom_value')
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: env check
        Scenario: a
          Given I check the environment variable

        Scenario: b
          Given I check the environment variable
      """
    When I run cucumber-js with arguments `--parallel 2` and env `MY_CUSTOM_VAR=my_custom_value`
    Then it passes

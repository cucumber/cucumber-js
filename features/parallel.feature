Feature: Running scenarios in parallel

  Scenario: running in parallel can improve speed if there are async operations
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'
      import Promise from 'bluebird'

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
      import {BeforeAll, Given} from 'cucumber'
      import Promise from 'bluebird'

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
      BeforeAll hook errored on slave 0, process exiting:
      """
    And the error output contains the text:
      """
      BeforeAll hook errored on slave 1, process exiting:
      """
    And the error output contains the text:
      """
      my error
      """
    Then it fails

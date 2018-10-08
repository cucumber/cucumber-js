Feature: Running scenarios in parallel

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'
      import Promise from 'bluebird'

      Given(/^a slow step$/, function(callback) {
        setTimeout(callback, 1000)
      })
      """

  Scenario: running in parallel can improve speed if there are async operations
    Given a file named "features/a.feature" with:
      """
      Feature: slow
        Scenario: a
          Given a slow step

        Scenario: b
          Given a slow step
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes

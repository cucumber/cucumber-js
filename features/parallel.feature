Feature: parallel

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given, setDefaultTimeout} from 'cucumber'
      import Promise from 'bluebird'

      Given(/^a slow step$/, function(callback) {
        setTimeout(callback, 2000)
      })
      """
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a slow step
      """
    Given a file named "features/b.feature" with:
      """
      Feature:
        Scenario:
          When a slow step
      """
    Given a file named "features/c.feature" with:
      """
      Feature:
        Scenario:
          When a slow step
      """
    Given a file named "features/d.feature" with:
      """
      Feature:
        Scenario:
          When a slow step
      """

  Scenario: sequential
    When I run cucumber.js
    Then it finishs in more than 8 seconds

  Scenario: parallel
    When I run cucumber.js with `--parallel 4`
    Then it finishs in less than 5 seconds

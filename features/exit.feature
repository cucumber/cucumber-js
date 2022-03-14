@spawn
Feature: Exit

  Use `--exit` to exit when the test run finishes without
  waiting to the even loop to drain

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, After} = require('@cucumber/cucumber')

      Given('a step', function() {})

      After(() => {
        setTimeout(() => {
          console.log('external process done')
        }, 1000)
      })
      """

  Scenario: by default wait for the event loop to drain
    When I run cucumber-js
    Then the output contains the text:
      """
      external process done
      """

  Scenario Outline: exit immediately without waiting for the even loop to drain
    When I run cucumber-js with `<FLAG>`
    Then the output does not contain the text:
      """
      external process done
      """
    Examples:
      | FLAG         |
      | --exit       |
      | --force-exit |

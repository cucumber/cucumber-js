Feature: Error formatting
  Scenario: failing scenario with hook error
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a passing step$/, function() {})
      })
      """
    And a file named "features/support/hooks.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Before}) => {
        Before(function(_, callback) { callback('Fail') })
      })
      """
    When I run cucumber.js
    Then it fails
    And the output contains the text:
      """
      Failures:

      1) Scenario: some scenario # features/a.feature:2
         ✖ Before # features/support/hooks.js:4
             Error: Fail
      """
    And the output contains the text:
      """
         - Given a passing step # features/step_definitions/cucumber_steps.js:4

      1 scenario (1 failed)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: failing scenario has step with doc string
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a basic step
          And a step with a doc string
            \"\"\"
            my doc string
            \"\"\"
          And a pending step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a basic step$/, function() {})
        Given(/^a step with a doc string$/, function(str) {})
        Given(/^a pending step$/, function() { return 'pending' })
      })
      """
    When I run cucumber.js
    Then the output contains the text:
      """
      Warnings:

      1) Scenario: some scenario # features/a.feature:3
         ✔ Given a basic step # features/step_definitions/cucumber_steps.js:4
         ✔ And a step with a doc string # features/step_definitions/cucumber_steps.js:5
             \"\"\"
             my doc string
             \"\"\"
         ? And a pending step # features/step_definitions/cucumber_steps.js:6
             Pending
      """
    And it fails

  Scenario: failing scenario has step with data table
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a table:
            | foo\nbar    |bar |   baz |
            | foo\nbar\n\nbaz\n\\boo       |bar |   baz\nfoo |
          And a pending step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a table:$/, function(table) {})
        Given(/^a pending step$/, function() { return 'pending' })
      })
      """
    When I run cucumber.js
    Then the output contains the text:
      """
      Warnings:

      1) Scenario: some scenario # features/a.feature:3
         ✔ Given a table: # features/step_definitions/cucumber_steps.js:4
             | foo\nbar               | bar | baz      |
             | foo\nbar\n\nbaz\n\\boo | bar | baz\nfoo |
         ? And a pending step # features/step_definitions/cucumber_steps.js:5
             Pending
      """
    And it fails

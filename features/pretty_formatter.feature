Feature: Pretty Formatter
  In order to visualize the tests in an a set of Cucumber features
  Developers should be able to see prettified view of the scenarios that are being executed

  Scenario: Output pretty text for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs the text:
      """
      0 scenarios
      0 steps
      <duration-stat>
      """

  Scenario: Pretty formatter hides before and after hooks
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

      defineSupportCode(({After, Before}) => {
        Before(function() {})
        After(function() {})
      })
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs the text:
      """
      Scenario: some scenario
      ✔ Given a passing step

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  @spawn
  Scenario: Failing hook is reported as a failed step
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
        Before(function() { throw 'Fail' })
      })
      """
    When I run cucumber.js with `-f pretty`
    Then it fails
    And the output contains the text:
      """
      Scenario: some scenario
      - Given a passing step

      Failures:

      1) Scenario: some scenario - features/a.feature:2
         Step: Before
         Step Definition: features/support/hooks.js:4
         Message:
           Error: Fail
      """

  Scenario: Pretty formatter with doc strings
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a basic step
          And a step with a doc string
            \"\"\"
            my doc string
            \"\"\"
          And a basic step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a basic step$/, function() {})
        Given(/^a step with a doc string$/, function(str) {})
      })
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs the text:
      """
      Scenario: some scenario
      ✔ Given a basic step
      ✔ And a step with a doc string
          \"\"\"
          my doc string
          \"\"\"
      ✔ And a basic step

      1 scenario (1 passed)
      3 steps (3 passed)
      <duration-stat>
      """

  Scenario: pretty formatter with data table
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a table:
            | foo\nbar    |bar |   baz |
            | foo\nbar\n\nbaz\n\\boo       |bar |   baz\nfoo |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({Given}) => {
        Given(/^a table:$/, function(table) {})
      })
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs the text:
      """
      Scenario: some scenario
      ✔ Given a table:
          | foo\nbar               | bar | baz      |
          | foo\nbar\n\nbaz\n\\boo | bar | baz\nfoo |

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

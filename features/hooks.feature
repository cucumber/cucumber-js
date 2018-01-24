Feature: Environment Hooks

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {})
      """

  Scenario: Hooks are steps
    Given a file named "features/support/hooks.js" with:
      """
      import {After, Before} from 'cucumber'

      Before(function() {})
      After(function() {})
      """
    When I run cucumber-js
    Then the scenario "some scenario" has the steps
      | IDENTIFIER   |
      | Before       |
      | Given a step |
      | After        |

  Scenario: Failing before fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      import {Before} from 'cucumber'

      Before(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  @spawn
  Scenario: Failing after hook fails the scenario
    Given a file named "features/support/hooks.js" with:
      """
      import {After} from 'cucumber'

      After(function() { throw 'Fail' })
      """
    When I run cucumber-js
    Then it fails

  @spawn
  Scenario: After hooks still execute after a failure
    Given a file named "features/support/hooks.js" with:
      """
      import {After, Before} from 'cucumber'

      Before(function() { throw 'Fail' })
      After(function() {})
      """
    When I run cucumber-js
    Then it fails
    And the "After" hook has status "passed"

  Scenario: World is this in hooks
    Given a file named "features/support/world.js" with:
      """
      import {setWorldConstructor} from 'cucumber'

      function WorldConstructor() {
        return {
          isWorld: function() { return true }
        }
      }

      setWorldConstructor(WorldConstructor)
      """
    Given a file named "features/support/hooks.js" with:
      """
      import {After, Before} from 'cucumber'

      Before(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })

      After(function() {
        if (!this.isWorld()) {
          throw Error("Expected this to be world")
        }
      })
      """
    When I run cucumber-js
    Then it passes

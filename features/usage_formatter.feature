Feature: usage formatter

  As a developer with slow or unused steps
  I want a formatter which just outputs the step definition usage
  So I know where my bottelnecks are and what step definitions I can remove


  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given step A
          When step B
          And slow step B
          Then step C
      """
    And a file named "features/step_definitions/steps.ts" with:
      """
      import {When} from 'cucumber'

      When('step A', function(callback) { setTimeout(callback, 100) });
      When(/^(slow )?step B$/, function(slow, callback) {
        if (slow) {
          setTimeout(callback, 100)
        } else {
          callback()
        }
      });
      When('step C', function(callback) { setTimeout(callback, 10) });
      When('step D', function() {});
      """
    When I run cucumber-js with `--format usage`
    Then it outputs the text:
      """
      ┌────────────────────┬──────────┬───────────────────────────────────────┐
      │ Pattern / Text     │ Duration │ Location                              │
      ├────────────────────┼──────────┼───────────────────────────────────────┤
      │ step A             │ <d>ms    │ features/step_definitions/steps.ts:3  │
      │   step A           │ <d>ms    │ features/a.feature:3                  │
      ├────────────────────┼──────────┼───────────────────────────────────────┤
      │ /^(slow )?step B$/ │ <d>ms    │ features/step_definitions/steps.ts:4  │
      │   slow step B      │ <d>ms    │ features/a.feature:5                  │
      │   step B           │ <d>ms    │ features/a.feature:4                  │
      ├────────────────────┼──────────┼───────────────────────────────────────┤
      │ step C             │ <d>ms    │ features/step_definitions/steps.ts:11 │
      │   step C           │ <d>ms    │ features/a.feature:6                  │
      ├────────────────────┼──────────┼───────────────────────────────────────┤
      │ step D             │ UNUSED   │ features/step_definitions/steps.ts:12 │
      └────────────────────┴──────────┴───────────────────────────────────────┘
      """

  Scenario: only list 5 slowest matches
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given slow step
          And step

        Examples:
          | <ID> |
          | 1    |
          | 2    |
          | 3    |
          | 4    |
          | 5    |
      """
    And a file named "features/step_definitions/steps.ts" with:
      """
      import {When} from 'cucumber'

      When(/^(slow )?step$/, function(slow, callback) {
        if (slow) {
          setTimeout(callback, 100)
        } else {
          callback()
        }
      });
      """
    When I run cucumber-js with `--format usage`
    Then it outputs the text:
      """
      ┌──────────────────┬──────────┬──────────────────────────────────────┐
      │ Pattern / Text   │ Duration │ Location                             │
      ├──────────────────┼──────────┼──────────────────────────────────────┤
      │ /^(slow )?step$/ │ <d>ms    │ features/step_definitions/steps.ts:3 │
      │   slow step      │ <d>ms    │ features/a.feature:3                 │
      │   slow step      │ <d>ms    │ features/a.feature:3                 │
      │   slow step      │ <d>ms    │ features/a.feature:3                 │
      │   slow step      │ <d>ms    │ features/a.feature:3                 │
      │   slow step      │ <d>ms    │ features/a.feature:3                 │
      │   5 more         │          │                                      │
      └──────────────────┴──────────┴──────────────────────────────────────┘
      """

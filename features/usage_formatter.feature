Feature: snippets formatter

  As a developer with slow or user steps
  I want a formatter which just outputs the step definition usage
  So I know where my bottelnecks are and what outdated step definitions I can remove


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
    And a file named "features/step_definitions/steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
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
      })
      """
    When I run cucumber-js with `--format usage`
    Then it outputs the text:
      """
      ┌───────────────────────────────────────┬───────────────┬──────────────────────┐
      │ Step Definition                       │ Mean Duration │ Matches              │
      ├───────────────────────────────────────┼───────────────┼──────────────────────┤
      │ step A                                │ <d>ms         │ step A               │
      │ features/step_definitions/steps.js:4  │               │ features/a.feature:3 │
      │                                       │               │ <d>ms                │
      ├───────────────────────────────────────┼───────────────┼──────────────────────┤
      │ /^(slow )?step B$/                    │ <d>ms         │ slow step B          │
      │ features/step_definitions/steps.js:5  │               │ features/a.feature:5 │
      │                                       │               │ <d>ms                │
      │                                       │               │                      │
      │                                       │               │ step B               │
      │                                       │               │ features/a.feature:4 │
      │                                       │               │ <d>ms                │
      ├───────────────────────────────────────┼───────────────┼──────────────────────┤
      │ step C                                │ <d>ms         │ step C               │
      │ features/step_definitions/steps.js:12 │               │ features/a.feature:6 │
      │                                       │               │ <d>ms                │
      ├───────────────────────────────────────┼───────────────┼──────────────────────┤
      │ step D                                │ UNUSED        │ UNUSED               │
      │ features/step_definitions/steps.js:13 │               │                      │
      └───────────────────────────────────────┴───────────────┴──────────────────────┘
      """

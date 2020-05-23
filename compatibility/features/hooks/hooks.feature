Feature: Hooks
  Hooks are special steps that run before or after each scenario's steps.
  They can also conditionally target specific scenarios, using tag expressions

  Scenario: no tags, passed step
    When a step passes

  Scenario: no tags, failed step
    When a step throws an exception

  Scenario: no tags, undefined step
    When a step throws an exception

  @some-tag
  Scenario: with a tag, passed step
    When a step passes

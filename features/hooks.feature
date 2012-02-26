Feature: Environment Hooks

  The following scenario is a regression test for special "around" hooks which
  deserve a bit more of attention.

  Scenario: Tagged around hook with untagged scenario
    Given an around hook tagged with "@foo"
    When Cucumber executes a scenario with no tags
    Then the hook is not fired

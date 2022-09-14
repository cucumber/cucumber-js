@spawn
Feature: Stack traces
  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
          And a failing step
      """
    And a file named "features/steps.ts" with:
      """
      import { Given } from '@cucumber/cucumber'

      interface Foo {
        message: string
      }

      Given('a passing step', function() {})

      Given('a failing step', function() {
        throw new Error('boom')
      })
      """

  Scenario: commonjs
    When I run cucumber-js with `--require-module ts-node/register --require features/steps.ts`
    Then the output contains the text:
    """
    /features/steps.ts:10:9
    """
    And it fails

  Scenario: esm
    Given my env includes "{\"NODE_OPTIONS\":\"--loader ts-node/esm\"}"
    When I run cucumber-js with `--import features/steps.ts`
    Then the output contains the text:
    """
    /features/steps.ts:10:9
    """
    And it fails

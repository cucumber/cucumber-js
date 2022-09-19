@spawn
@source-mapping
Feature: Stack traces
  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
          And a failing step
      """

  Rule: Source maps are respected when dealing with transpiled support code

    Just-in-time transpilers like `@babel/register` and `ts-node` emit source maps with
    the transpiled code. Cucumber users expect stack traces to point to the line and column
    in the original source file when there is an error.

    Background:
      Given a file named "features/steps.ts" with:
      """
      import { Given } from '@cucumber/cucumber'

      interface Something {
        field1: string
        field2: string
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
      /features/steps.ts:11:9
      """
      And it fails

    Scenario: esm
      Given my env includes "{\"NODE_OPTIONS\":\"--loader ts-node/esm\"}"
      When I run cucumber-js with `--import features/steps.ts`
      Then the output contains the text:
      """
      /features/steps.ts:11:9
      """
      And it fails

Feature: Stateless step definitions

  Scenario: simple
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given my number is 21
          When my number is multiplied by 2
          Then my number should be 42
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import assert from 'assert'
      import {initialize, fnGiven as Given, fnWhen as When, fnThen as Then} from 'cucumber'

      const multiply =
        async (multiplicand, multiplier) => multiplicand * multiplier

      initialize(() => ({myNumber: null}))

      Given(/^my number is (\d+)$/, (ctx, myNewNumber) =>
        Object.assign({}, ctx, {myNumber: myNewNumber})
      )

      When(/^my number is multiplied by (\d+)$/, (ctx, multiplier) =>
        Object.assign({}, ctx, {
          myNumber: multiply(ctx.myNumber, multiplier)
        })
      )

      Then(/^my number should be (\d+)$/, (ctx, expectedNumber) => {
        assert.equal(ctx.myNumber, expectedNumber)
      })
      """
    When I run cucumber-js
    Then it passes

Feature: BeforeAll/AfterAll hooks and the parallel runtime

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given a step

        Scenario: second scenario
          Given a step
      """
    And a file named "features/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', () => {})
      """

  Scenario: global hooks run only on worker by default
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll} = require('@cucumber/cucumber')

      BeforeAll({name: 'Before test run'}, () => {})
      AfterAll({name: 'After test run'}, () => {})
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And the global hook "Before test run" has 2 executions
    And the global hook "After test run" has 2 executions

  Scenario: global hooks run only on worker when specified
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, HookTarget} = require('@cucumber/cucumber')

      BeforeAll({name: 'Before test run', on: HookTarget.WORKER}, () => {})
      AfterAll({name: 'After test run', on: HookTarget.WORKER}, () => {})
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And the global hook "Before test run" has 2 executions
    And the global hook "After test run" has 2 executions

  Scenario: global hooks run only on coordinator when specified
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, HookTarget} = require('@cucumber/cucumber')

      BeforeAll({name: 'Before test run', on: HookTarget.COORDINATOR}, () => {})
      AfterAll({name: 'After test run', on: HookTarget.COORDINATOR}, () => {})
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And the global hook "Before test run" has 1 executions
    And the global hook "After test run" has 1 executions

  Scenario: global hooks run on coordinator and worker when specified
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, HookTarget} = require('@cucumber/cucumber')

      BeforeAll({name: 'Before test run', on: HookTarget.BOTH}, () => {})
      AfterAll({name: 'After test run', on: HookTarget.BOTH}, () => {})
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And the global hook "Before test run" has 3 executions
    And the global hook "After test run" has 3 executions
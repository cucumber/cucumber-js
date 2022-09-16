Feature: Before/AfterAll hooks in parallel

  When running in parallel, Cucumber-JS runs some code on a "Co-ordinator" process,
  but all the user code runs in a "Worker" process.

  When defining BeforeAll/AfterAll hooks, you can choose whather to run them on
  the coordinator, the worker, or both.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given first step

        Scenario: second scenario
          Given second step
      """

  Scenario: Just run the AfterAll hooks once, on the coordinator

    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, HookParallelMode, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      let counter = 0

      Given('first step', function() {
        counter ++
        expect(counter).to.eql(1)
      })

      Given('second step', function() {
        counter ++
        expect(counter).to.eql(1)
      })

      AfterAll({ parallelMode: HookParallelMode.WORKER_ONLY }, function() {
        counter ++
        console.log('worker: ', counter)
        expect(counter).to.eql(2)
      })

      AfterAll({ parallelMode: HookParallelMode.COORDINATOR_ONLY }, function() {
        counter ++
        console.log('coordinator: ', counter)
        expect(counter).to.eql(1)
      })
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes

  Rule: Coordinator's AfterAll hook should run after the Workers' AfterAllHooks

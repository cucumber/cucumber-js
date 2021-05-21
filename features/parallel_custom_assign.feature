Feature: Running scenarios in parallel with custom assignment

  @spawn
  Scenario: Bad parallel assignment helper uses 1 worker
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Then, setParallelCanAssign} = require('@cucumber/cucumber')
      setParallelCanAssign(() => false)
      Then(/^value is (\d+)$/, function(v, cb) {
         setTimeout(cb, 150)
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: only one worker works
        Scenario: someone must do work
          Then value is 1

        Scenario: even if it's all the work
          Then value is 2
      """
    When I run cucumber-js with `--parallel 2`
    Then the error output contains the text:
    """
    WARNING: All workers went idle 2 time(s). Consider revising handler passed to setParallelCanAssign.
    """
    And no tests ran in tandem

  Scenario: Both works run tests when a valid assignment helper is used
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Then, setParallelCanAssign} = require('@cucumber/cucumber')
      const {expect} = require('chai')
      let value = 0;
      setParallelCanAssign(() => true)
      Then(/^value is (\d+)$/, function(v, cb) {
        expect(++value).to.eq(v)
         setTimeout(cb, 300)
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: separate worker for each scenario
        Scenario: a
          Then value is 1

        Scenario: b
          Then value is 1
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes

  Scenario: assignment is appropriately applied
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, setParallelCanAssign} = require('@cucumber/cucumber')
      const _ = require('lodash')
      const {expect} = require('chai')
      let worker = null;
      let processed = 0;
      setParallelCanAssign((pickleInQuestion, picklesInProgress) => _.isEmpty(pickleInQuestion.tags)
        || _.every(picklesInProgress, ({tags}) => _.isEmpty(tags) || tags[0].name !== pickleInQuestion.tags[0].name))

      function step_def(delay) {
        return function(cb) {
          setTimeout(cb, delay)
        }
      }

      Given(/^complex step$/, step_def(300))
      Given(/^simple step$/, step_def(200))
      """
    And a file named "features/a.feature" with:
      """
      Feature: adheres to setParallelCanAssign handler
        @complex
        Scenario: 1
          Given complex step

        @complex
        Scenario: 2
          Given complex step

        @complex
        Scenario: 3
          Given complex step

        @simple
        Scenario: 4
          Given simple step

        @simple
        Scenario: 5
          Given simple step

        @simple
        Scenario: 6
          Given simple step
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And tandem tests have unique first tag
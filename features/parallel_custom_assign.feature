Feature: Running scenarios in parallel with custom assignment

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
    Then it passes
    And tandem tests verified
    """
    expect.fail('No tests should have executed at the same time')
    """

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

  Scenario: assignment is appropriately applied and fails at last processed scenario 'a'
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, setParallelCanAssign} = require('@cucumber/cucumber')
      let flag = true
      setParallelCanAssign(() => (flag = !flag))
      Given(/^scenario (\d+)$/, function(scenario, cb) {
        setTimeout(cb, 150)
      })
      """
    And a file named "features/a.feature" with:
      """
      Feature: adheres to setParallelCanAssign handler
        Scenario: a
          Given scenario 1

        Scenario: b
          Given scenario 2

        Scenario: c
          Given scenario 3
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And it runs tests in order b, c, a

  Scenario: assignment is appropriately applied and fails at last processed scenario 'a'
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, setParallelCanAssign} = require('@cucumber/cucumber')
      const _ = require('lodash')
      const {expect} = require('chai')
      let worker = null;
      let processed = 0;
      setParallelCanAssign((pickleInQuestion, picklesInProgress) => _.isEmpty(pickleInQuestion.tags)
        || _.every(picklesInProgress, ({tags}) => _.isEmpty(tags) || tags[0].name !== pickleInQuestion.tags[0].name))

      function step_def(name, delay) {
        return function(scenario, cb) {
          if (worker == null) worker = name;
          if (processed !== 3) {
            expect(worker).to.eq(name)
            expect(scenario).to.eq(++processed)
          } else {
            // Scenario 3 might get picked up by B as both are ready at this point
            expect(scenario).to.eq(processed++)
          }
          setTimeout(cb, delay)
        }
      }

      Given(/^scenario complex (\d+)$/, step_def('A', 300))
      Given(/^scenario simple (\d+)$/, step_def('B', 200))
      """
    And a file named "features/a.feature" with:
      """
      Feature: adheres to setParallelCanAssign handler
        @complex
        Scenario: 1
          Given scenario complex 1

        @complex
        Scenario: 2
          Given scenario complex 2

        @complex
        Scenario: 3
          Given scenario complex 3

        @simple
        Scenario: 4
          Given scenario simple 1

        @simple
        Scenario: 5
          Given scenario simple 2

        @simple
        Scenario: 6
          Given scenario simple 3
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And tandem tests verified
    """
    expect(_pickle1.tags[0].name).to.not.eq(_pickle2.tags[0].name)
    """
Feature: Running scenarios in parallel with custom assignment

  Scenario: Bad parallel assignment helper uses 1 worker
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Then, setParallelCanAssign} = require('@cucumber/cucumber')
      const {expect} = require('chai')
      let value = 0;
      setParallelCanAssign(() => false)
      Then(/^value is (\d+)$/, function(v, cb) {
        expect(++value).to.eq(v)
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

  Scenario: Both works run tests when a valid assignment helper is used
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Then, setParallelCanAssign} = require('@cucumber/cucumber')
      const {expect} = require('chai')
      let value = 0;
      setParallelCanAssign(() => true)
      Then(/^value is (\d+)$/, function(v, cb) {
        expect(++value).to.eq(v)
         setTimeout(cb, 150)
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
      let processed = 0;
      setParallelCanAssign(() => (flag = !flag))
      Given(/^scenario (\d+)$/, function(scenario, cb) {
        setTimeout(cb, 150)
        if (scenario === 1) throw Error(`#${scenario} was test ${++processed} on this worker`)
        processed++;
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
    Then it fails
    And the output contains the text:
    """
      #1 was test 2 on this worker
    """
Feature: Allow time to be faked by utilities such as sinon.useFakeTimers
  Background: Before and After hooks to enable faking time.
    Given a file named "features/support/hooks.js" with:
    """
    const {After, Before} = require('@cucumber/cucumber')
    const sinon = require('sinon')

    Before(function(scenario) {
      this.clock = sinon.useFakeTimers()
    })

    After(function(scenario) {
      this.clock.restore()
    })
    """

  Scenario: faked time doesn't trigger the test runner timeout
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a faked time step
      """

    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const assert = require('assert')
      const {Given} = require('@cucumber/cucumber')
      const sinon = require('sinon')

      Given(/^a faked time step$/, function () {
        var testFunction = sinon.stub()
        setTimeout(testFunction, 10000)
        assert(!testFunction.called)
        this.clock.tick(10001)
        assert(testFunction.called)
      })
      """
      When I run cucumber-js
      Then it passes

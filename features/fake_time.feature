Feature: Allow time to be faked by utilities such as sinon.useFakeTimers
  Background: Before and After hooks to enable faking time.
    Given a file named "features/support/hooks.js" with:
    """
    import {defineSupportCode} from 'cucumber'
    import sinon from 'sinon'

    defineSupportCode(({After, Before}) => {
      Before(function(scenario) {
        this.clock = sinon.useFakeTimers()
      })

      After(function(scenario) {
        this.clock.restore()
      })
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
      import assert from 'assert'
      import {defineSupportCode} from 'cucumber'
      import sinon from 'sinon'

      defineSupportCode(({Given}) => {
        Given(/^a faked time step$/, function () {
          var testFunction = sinon.stub()
          setTimeout(testFunction, 10000)
          assert(!testFunction.called)
          this.clock.tick(10001)
          assert(testFunction.called)
        })
      })
      """
      When I run cucumber.js
      Then it passes

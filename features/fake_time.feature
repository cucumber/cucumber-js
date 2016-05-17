Feature: Allow time to be faked by utilities such as sinon.useFakeTimers
  Background: Before and After hooks to enable faking time.
    Given a file named "features/support/hooks.js" with:
    """
    var sinon = require('sinon');
    var hooks = function () {

      this.Before(function(scenario) {
        this.clock = sinon.useFakeTimers();
      });

      this.After(function(scenario) {
        this.clock.restore();
      });

    };
    module.exports = hooks;
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
      var assert = require('assert');
      var sinon = require('sinon')

      stepDefinitions = function() {
        this.Given(/^a faked time step$/, function (done) {
          var testFunction = sinon.stub();
          setTimeout(testFunction, 10000);
          assert(!testFunction.called);
          this.clock.tick(10001);
          assert(testFunction.called);
          done()
        });
      };

      module.exports = stepDefinitions
      """
      When I run cucumber.js with `--strict`
      Then it passes

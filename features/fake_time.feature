Feature: Allow time to be faked by utilities such as sinon.useFakeTimers
  Background: Before and After hooks to enable faking time.
    Given a file named "features/support/hooks.js" with:
    """
    var sinon = require('sinon');
    var hooks = function () {

      this.Before({tags: ['@fakedTime']}, function(scenario, callback) {
        this.clock = sinon.useFakeTimers();
        callback();
      });

      this.After({tags: ['@fakedTime']}, function(scenario, callback) {
        this.clock.restore();
        callback();
      });

    };

    module.exports = hooks;
    """

  Scenario: Use fake timers to faked time
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        @fakedTime
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
          setTimeout(testFunction, 100);
          assert(!testFunction.called);
          this.clock.tick(101);
          assert(testFunction.called);
          done()
        });
      };

      module.exports = stepDefinitions
      """

      When I run cucumber.js with `--strict`
      Then it passes


  Scenario: faked time doesn't trigger the test runner timeout
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        @fakedTime
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


  Scenario: real time is restored

    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        @fakedTime
        Scenario: triggers the fakedTime before/after hooks
          Given a faked time step

        Scenario: using real time
          Given a real time step
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

        this.Given(/^a real time step$/, function (done) {
          var testFunction = sinon.stub();
          setTimeout(function () {
            assert(testFunction.called);
            done();
          }, 20)
          setTimeout(testFunction, 10);
          assert(!testFunction.called);
        });
      };

      module.exports = stepDefinitions
      """
      When I run cucumber.js with `--strict`
      Then it passes

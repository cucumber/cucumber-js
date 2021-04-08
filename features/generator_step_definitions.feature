Feature: Generator Step Definitions
  In order to use new JavaScript features
  As a developer
  I want Cucumber to provide the possibility to use ES6 features

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: Step is a generator
        Scenario: Step generator run successfully
          When I call a step which is a generator with return value "ok"
          Then I can see the yielded "ok" value in the context
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const assert = require('assert')
      const {setWorldConstructor, Then, When} = require('@cucumber/cucumber')

      setWorldConstructor(function () {
        this.context = ""
      })

      When(/^I call a step which is a generator with return value "([^"]*)"$/, function *(return_value) {
        this.context = yield Promise.resolve(return_value);
      })

      Then(/^I can see the yielded "([^"]*)" value in the context$/, function(return_value) {
        assert.equal(this.context, return_value)
      })
      """

  @spawn
  Scenario: without generator function runner
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      The following hook/step definitions use generator functions:

        features/step_definitions/cucumber_steps.js:8

      Use 'this.setDefinitionFunctionWrapper(fn)' to wrap them in a function that returns a promise
      """

  Scenario: with generator function wrapper
    Given a file named "features/support/setup.js" with:
      """
      const isGenerator = require('is-generator')
      const {coroutine} = require('bluebird')
      const {setDefinitionFunctionWrapper} = require('@cucumber/cucumber')

      setDefinitionFunctionWrapper(function (fn) {
        if (isGenerator.fn(fn)) {
          return coroutine(fn)
        } else {
          return fn
        }
      })
      """
    When I run cucumber-js
    Then it passes

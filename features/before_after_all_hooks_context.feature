Feature: Before / After All Hooks Context

  It should be possible to store context in a BeforeAll hook
  and have the context be available to the scenarios in the World 

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          Given first step

        Scenario: second scenario
          Given second step
      """

  Scenario: before all / after all hooks share a testRunContext with scenario steps
    Given a file named "features/support/hooks.js" with:
      """
      const {AfterAll, BeforeAll, Given} = require('@cucumber/cucumber')
      const {expect} = require('chai')

      BeforeAll(function() {
        this.myVar = {foo: 1}
      })

      Given('first step', function() {
        expect(this.myVar.foo).to.eql(1) 
      })

      Given('second step', function() {
        expect(this.myVar.foo).to.eql(1) 
      })

      AfterAll(function() {
        expect(this.myVar.foo).to.eql(1)
      })
      """
    When I run cucumber-js
    Then it passes

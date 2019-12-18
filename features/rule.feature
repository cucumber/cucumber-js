Feature: Rule keyword

  Scenario: Rule with multiple examples, passing
    Given a file named "features/highlander.feature" with:
      """
      Feature: Highlander

        Rule: There can be only One

          Example: Only One -- More than one alive
            Given there are 3 ninjas
            And there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given, When, Then} from 'cucumber'
      import assert from 'assert'

      Given('there are {int} ninjas', function(count) {
        this.total = count
      })

      Given('there is only 1 ninja alive', function() {
        this.living = 1
      })

      Given('there are more than one ninja alive', function() {
        this.living = 2
      })

      When('2 ninjas meet, they will fight', function() {
        this.deaths = 1
        this.living = 1
      })

      Then('one ninja dies', function() {
        assert.equal(1, this.deaths)
      })

      Then('there is one ninja less alive', function() {
        assert.equal(1, this.living)
      })

      Then('they will live forever', function() {

      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: Rule with multiple examples, failing
    Given a file named "features/highlander.feature" with:
      """
      Feature: Highlander

        Rule: There can be only One

          Example: Only One -- More than one alive
            Given there are 3 ninjas
            And there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given, When, Then} from 'cucumber'
      import assert from 'assert'

      Given('there are {int} ninjas', function(count) {
        this.total = count
      })

      Given('there is only 1 ninja alive', function() {
        this.living = 1
      })

      Given('there are more than one ninja alive', function() {
        this.living = 2
      })

      When('2 ninjas meet, they will fight', function() {
        // broken implementation...
      })

      Then('one ninja dies', function() {
        assert.equal(1, this.deaths)
      })

      Then('there is one ninja less alive', function() {
        assert.equal(1, this.living)
      })

      Then('they will live forever', function() {

      })
      """
    When I run cucumber-js
    Then it fails

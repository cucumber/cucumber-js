Feature: Rule keyword

  Scenario: Rule with background and multiple examples, passing
    Given a file named "features/highlander.feature" with:
      """
      Feature: Highlander

        Rule: There can be only One
          Background:
            Given there are 3 ninjas

          Example: Only One -- More than one alive
            Given there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, When, Then} = require('@cucumber/cucumber')

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

      })

      Then('there is one ninja less alive', function() {

      })

      Then('they will live forever', function() {

      })
      """
    When I run cucumber-js
    Then it passes
    And it outputs the text:
    """
    ........

    2 scenarios (2 passed)
    8 steps (8 passed)
    <duration-stat>
    """

  Scenario: Rule with background and multiple examples, failing
    Given a file named "features/highlander.feature" with:
      """
      Feature: Highlander

        Rule: There can be only One
          Background:
            Given there are 3 ninjas

          Example: Only One -- More than one alive
            Given there are more than one ninja alive
            When 2 ninjas meet, they will fight
            Then one ninja dies
            And there is one ninja less alive

          Example: Only One -- One alive
            Given there is only 1 ninja alive
            Then they will live forever
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, When, Then} = require('@cucumber/cucumber')

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
        throw 'fail'
      })

      Then('there is one ninja less alive', function() {

      })

      Then('they will live forever', function() {

      })
      """
    When I run cucumber-js
    Then it fails
    And it outputs the text:
    """
    ...F-...

    Failed scenarios:
    1) Only One -- More than one alive # features/highlander.feature:7
         Then one ninja dies # features/step_definitions/cucumber_steps.js:20
             Error: fail

    2 scenarios (1 passed, 1 failed)
    8 steps (6 passed, 1 skipped, 1 failed)
    <duration-stat>
    """

  Scenario: Tags on Rules are honoured
    Given a file named "features/highlander.feature" with:
      """
      Feature: a feature

        @mytag
        Rule: a rule

          Example: a scenario
            Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('a step', function() {})
      """
    When I run cucumber-js with arguments `--tags @mytag` and env ``
    Then it passes
    And it outputs the text:
    """
    .

    1 scenarios (1 passed)
    1 steps (1 passed)
    <duration-stat>
    """

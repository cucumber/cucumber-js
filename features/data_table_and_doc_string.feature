Feature: data table and doc string

  Scenario: data table before doc string
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a data table and doc string step
            | cucumber |
            \"\"\"
            Cucumis sativus
            \"\"\"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a data table and doc string step$/, function(dataTable, docString) {
        assert.deepEqual(dataTable.raw(), [["cucumber"]])
        assert.equal(docString, "Cucumis sativus")
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: doc string before data table
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a doc string and data table step
            \"\"\"
            Cucumis sativus
            \"\"\"
            | cucumber |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a doc string and data table step$/, function(docString, dataTable) {
        assert.equal(docString, "Cucumis sativus")
        assert.deepEqual(dataTable.raw(), [["cucumber"]])
      })
      """
    When I run cucumber-js
    Then it passes

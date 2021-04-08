Feature: doc string

  Scenario: as only step definition argument
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a doc string step
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a doc string step$/, function(docString) {
        assert.equal(docString, "The cucumber (Cucumis sativus) is a widely " +
                                "cultivated plant in the gourd family Cucurbitaceae.")
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: with other step definition arguments
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a "doc string" step
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a "([^"]*)" step$/, function(type, docString) {
        assert.equal(type, "doc string")
        assert.equal(docString, "The cucumber (Cucumis sativus) is a widely " +
                                "cultivated plant in the gourd family Cucurbitaceae.")
      })
      """
    When I run cucumber-js
    Then it passes

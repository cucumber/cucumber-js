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
      var assert = require('assert');

      var cucumberSteps = function() {
        this.When(/^a doc string step$/, function(docString) {
          assert.equal(docString, "The cucumber (Cucumis sativus) is a widely " +
                                  "cultivated plant in the gourd family Cucurbitaceae.")
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
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
      var assert = require('assert');

      var cucumberSteps = function() {
        this.When(/^a "([^"]*)" step$/, function(type, docString) {
          assert.equal(type, "doc string");
          assert.equal(docString, "The cucumber (Cucumis sativus) is a widely " +
                                  "cultivated plant in the gourd family Cucurbitaceae.")
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes

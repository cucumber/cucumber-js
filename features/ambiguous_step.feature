Feature: Ambiguous Steps

  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a ambiguous step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a ambiguous step$/, function() {});
      When(/^a (.*) step$/, function(status) {});
      """
    When I run cucumber-js with `-f progress`
    Then it outputs the text:
      """
      A

      Ambiguous scenarios:
      1) a scenario name # features/a.feature:2
           Given a ambiguous step
               Multiple matching step definitions found:
               • ^a ambiguous step$ # features/step_definitions/cucumber_steps.js:3
               • ^a (.*) step$ # features/step_definitions/cucumber_steps.js:4

      1 scenarios (1 ambiguous)
      1 steps (1 ambiguous)
      <duration-stat>
      """
    And it fails

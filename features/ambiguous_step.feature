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
      var cucumberSteps = function() {
        this.When(/^a ambiguous step$/, function() { });
        this.When(/^a (.*) step$/, function(status) { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f progress`
    Then it outputs this text:
      """
      A

      Failures:

      1) Scenario: a scenario name - features/a.feature:2
         Step: Given a ambiguous step - features/a.feature:3
         Message:
           Multiple step definitions match:
             /^a ambiguous step$/ - features/step_definitions/cucumber_steps.js:2
             /^a (.*) step$/      - features/step_definitions/cucumber_steps.js:3

      1 scenario (1 ambiguous)
      1 step (1 ambiguous)
      <duration-stat>
      """
    And the exit status should be 1

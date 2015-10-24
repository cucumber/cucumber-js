Feature: Ambiguous Steps

  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: Missing
        Scenario: Missing
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

      1 scenario (1 ambiguous)
      1 step (1 ambiguous)
      <duration-stat>

      The following step definitions are ambiguous

      "a ambiguous step" matches:
        /^a ambiguous step$/ # step_definitions/cucumber_steps.js:2
        /^a (.*) step$/      # step_definitions/cucumber_steps.js:3
      """
    And the exit status should be 0

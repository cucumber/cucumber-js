Feature: Custom stack trace

  Scenario: Error.prepareStackTrace override
    Given a file named "features/a.feature" with:
      """
      Feature: Some feature
        Scenario: Some scenario
          Given I override Error.prepareStackTrace
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^I override Error.prepareStackTrace$/, function() {
          Error.prepareStackTrace = function() {
            return 'Custom message';
          }
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js
    Then it outputs this text:
      """
      Feature: Some feature

        Scenario: Some scenario
          Given I override Error.prepareStackTrace

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

Feature: Fail fast

  Using the `--fail-fast` flag ends the suite after the first failure

  Scenario: --fail-fast
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step

        Scenario: Passing
          Given a passing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a failing step$/, function() { throw 'fail' });
        this.When(/^a passing step$/, function() { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `--fail-fast`
    Then it outputs this text:
      """
      Feature:

        Scenario: Failing
        ✖ Given a failing step

      Failures:

      1) Scenario: Failing - features/a.feature:2
         Step: Given a failing step - features/a.feature:3
         Step Definition: features/step_definitions/cucumber_steps.js:2
         Message:
           fail

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
    And the exit status should be 1

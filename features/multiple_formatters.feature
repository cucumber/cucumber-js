Feature: Multiple Formatter

  Scenario: Ability to specify multiple formatters
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step which passes
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f progress -f pretty:pretty.txt`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the file "pretty.txt" has the text:
      """
      Feature: some feature

        Scenario: I've declared one step which passes   # features/a.feature:3
          Given This step is passing                    # features/a.feature:4

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

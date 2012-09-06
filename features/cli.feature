Feature: Command line interface
  In order to run cucumber in different contexts
  As a person who wants to run features
  I want to run Cucumber on the command line

  Scenario: run a single feature
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js features/a.feature`
    Then it should pass with:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """

  Scenario: run a single feature without step definitions
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is undefined
      """
    When I run `cucumber.js features/a.feature`
    Then it should pass with:
      """
      U

      1 scenario (1 undefined)
      1 step (1 undefined)

      """

  Scenario: run feature with non-default step definitions file location specified (-r option)
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is passing
      """
    And a file named "step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js features/a.feature -r step_definitions/cucumber_steps.js`
    Then it should pass with:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """

  Scenario: run feature with step definitions in required directory (-r option)
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is passing
      """
    And a file named "step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js features/a.feature -r step_definitions`
    Then it should pass with:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """

  Scenario: display Cucumber version
    When I run `cucumber.js --version`
    Then I see the version of Cucumber

  Scenario: display help
    When I run `cucumber.js --help`
    Then I see the help of Cucumber

  Scenario: display help (short flag)
    When I run `cucumber.js -h`
    Then I see the help of Cucumber

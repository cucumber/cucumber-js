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
    When I run cucumber.js with `-f progress features/a.feature`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: run a single feature without step definitions
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          When a step is undefined
      """
    When I run cucumber.js with `-f progress features/a.feature`
    Then it outputs this text:
      """
      U

      Warnings:

      1) Scenario: some scenario - features/a.feature:2
         Step: When a step is undefined - features/a.feature:3
         Message:
           Undefined. Implement with the following snippet:

             this.When(/^a step is undefined$/, function (callback) {
               // Write code here that turns the phrase above into concrete actions
               callback(null, 'pending');
             });

      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """
    And the exit status should be 0

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
    When I run cucumber.js with `-f progress features/a.feature -r step_definitions/cucumber_steps.js`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

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
    When I run cucumber.js with `-f progress features/a.feature -r step_definitions`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the exit status should be 0

  Scenario: display Cucumber version
    When I run cucumber.js with `--version`
    Then I see the version of Cucumber
    And the exit status should be 0

  Scenario: display help
    When I run cucumber.js with `--help`
    Then I see the help of Cucumber
    And the exit status should be 0

  Scenario: display help (short flag)
    When I run cucumber.js with `-h`
    Then I see the help of Cucumber
    And the exit status should be 0

Scenario: run a single failing feature
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          When a step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is failing$/, function(callback) { callback("forced error"); });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f progress features/a.feature`
    Then it outputs this text:
      """
      F

      Failures:

      1) Scenario: some scenario - features/a.feature:2
         Step: When a step is failing - features/a.feature:3
         Step Definition: features/step_definitions/cucumber_steps.js:2
         Message:
           forced error

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
	And the exit status should be 1

  Scenario: run a single failing feature with an empty hooks file
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          When a step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is failing$/, function(callback) { callback("forced error"); });
      };
      module.exports = cucumberSteps;
      """
	And a file named "features/support/hooks.js" with:
      """
      """
    When I run cucumber.js with `-f progress features/a.feature`
    Then it outputs this text:
      """
      F

      Failures:

      1) Scenario: some scenario - features/a.feature:2
         Step: When a step is failing - features/a.feature:3
         Step Definition: features/step_definitions/cucumber_steps.js:2
         Message:
           forced error

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
	And the exit status should be 1

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
    When I run `cucumber.js -f progress features/a.feature`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """
    And the exit status should be 0

  Scenario: run a single scenario within feature
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: first scenario
          When a step is passing

        Scenario: second scenario
          When a step does not exist
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f progress features/a.feature:2`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """
    And the exit status should be 0

  Scenario: run a single feature without step definitions
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is undefined
      """
    When I run `cucumber.js -f progress features/a.feature`
    Then it outputs this text:
      """
      U

      1 scenario (1 undefined)
      1 step (1 undefined)

      You can implement step definitions for undefined steps with these snippets:

      this.When(/^a step is undefined$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
      });
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
    When I run `cucumber.js -f progress features/a.feature -r step_definitions/cucumber_steps.js`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

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
    When I run `cucumber.js -f progress features/a.feature -r step_definitions`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)

      """
    And the exit status should be 0

  Scenario: display Cucumber version
    When I run `cucumber.js --version`
    Then I see the version of Cucumber
    And the exit status should be 0

  Scenario: display help
    When I run `cucumber.js --help`
    Then I see the help of Cucumber
    And the exit status should be 0

  Scenario: display help (short flag)
    When I run `cucumber.js -h`
    Then I see the help of Cucumber
    And the exit status should be 0

Scenario: run a single failing feature
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          When a step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step is failing$/, function(callback) { callback("forced error"); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f progress features/a.feature`
    Then it outputs this text:
      """
      F

      (::) failed steps (::)

      forced error

      Failing scenarios:
      <current-directory>/features/a.feature:2 # Scenario:

      1 scenario (1 failed)
      1 step (1 failed)
      """
	And the exit status should be 1

  Scenario: run a single failing feature with an empty hooks file
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
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
    When I run `cucumber.js -f progress features/a.feature`
    Then it outputs this text:
      """
      F

      (::) failed steps (::)

      forced error

      Failing scenarios:
      <current-directory>/features/a.feature:2 # Scenario:

      1 scenario (1 failed)
      1 step (1 failed)
      """
	And the exit status should be 1

  Scenario: run a single failing feature with an AfterFeatures hook
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
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
      var hooks = function() {
        this.registerHandler('AfterFeatures', function (event, callback) {
          callback();
        });
      };
      module.exports = hooks;
      """
    When I run `cucumber.js -f progress features/a.feature`
    Then it outputs this text:
      """
      F

      (::) failed steps (::)

      forced error

      Failing scenarios:
      <current-directory>/features/a.feature:2 # Scenario:

      1 scenario (1 failed)
      1 step (1 failed)
      """
    And the exit status should be 1

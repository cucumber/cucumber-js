Feature: step definitions with string pattern
  Some people don't like Regexps as step definition patterns.
  Cucumber also supports string-based patterns.

  Scenario: simple
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """
    And a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.Given('a passing step', function(){});
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: parameter
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """
    And a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When('a $type step', function(type){
          if (type !== 'passing') {
            throw new Error('wrong type');
          }
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: multiple parameters
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """
    And a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When('a $type $object', function(type, object){
          if (type !== 'passing' && object !== 'step') {
            throw new Error('wrong type');
          }
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: multiple word parameter
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a "passing step"
      """
    And a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When('a "$multi_word_type"', function(type){
          if (type !== 'passing step') {
            throw new Error('wrong type');
          }
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

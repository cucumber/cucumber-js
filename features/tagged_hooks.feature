Feature: Tagged Hooks

  Background:
    Given a file named "features/step_definitions/world.js" with:
      """
      module.exports = function() {
        this.World = function() {
          this.value = 0
        };
      };
      """
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      var assert = require('assert');

      module.exports = function() {
        this.Then(/^the value is (\d*)$/, function(number) {
          assert.equal(parseInt(number), this.value);
        });
      };
      """

  Scenario: no tags
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Then the value is 0
      """
    When I run cucumber.js with `--strict`
    And the exit status should be 0

  Scenario: simple tag match
    Given a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      module.exports = function() {
        this.Before({tags: ['@foo']}, function() {
          this.value += 1;
        });
      };
      """
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Then the value is 0

        @foo
        Scenario:
          Then the value is 1
      """
    When I run cucumber.js with `--strict`
    And the exit status should be 0

  Scenario: or tag match
    Given a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      module.exports = function() {
        this.Before({tags: ['@foo,@bar']}, function() {
          this.value += 1;
        });
      };
      """
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Then the value is 0

        @foo
        Scenario:
          Then the value is 1

        @bar
        Scenario:
          Then the value is 1

        @foo @bar
        Scenario:
          Then the value is 1
      """
    When I run cucumber.js with `--strict`
    And the exit status should be 0

  Scenario: and tag match
    Given a file named "features/step_definitions/my_tagged_hooks.js" with:
      """
      module.exports = function() {
        this.Before({tags: ['@foo', '@bar']}, function() {
          this.value += 1;
        });
      };
      """
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Then the value is 0

        @foo
        Scenario:
          Then the value is 0

        @bar
        Scenario:
          Then the value is 0

        @foo @bar
        Scenario:
          Then the value is 1
      """
    When I run cucumber.js with `--strict`
    And the exit status should be 0

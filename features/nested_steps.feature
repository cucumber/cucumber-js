Feature: Nested Steps


  Background:
    Given a scenario with:
      """
      Given two turtles
      """
    And the step "a turtle" has a passing mapping

  Scenario: Use callback.step to call a single step
    Given a step definition that looks like this:
      """
      Given(/^two turtles$/, function(callback) {
        var World = this;
	World.step("a turtle", function() {
	  World.step("a turtle", function() {
	    callback()
	  });
	});
      });
      """
    When Cucumber runs the feature
    Then the feature passes
    And step "a turtle" invoked "2" times

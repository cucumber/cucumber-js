Feature: Background

  Background allows you to add some context to the scenarios in a
  single feature. A Background is much like a scenario containing a
  number of steps. The difference is when it is run. The background is
  run before each of your scenarios but after any of your Before
  Hooks.

  Scenario: One scenario and a background
    Given the following feature:
      """
      Feature: testing scenarios
        Background:
          Given a background step

        Scenario:
          When a scenario step
      """
    And the step "a background step" has a passing mapping
    And the step "a scenario step" has a passing mapping
    When Cucumber runs the feature
    Then the feature passes
    And the step "a background step" passes
    And the step "a scenario step" passes

  Scenario: Two scenarios and a background
    Given the following feature:
      """
      Feature: testing scenarios
        Background:
          Given a background step

        Scenario:
          When a scenario step

        Scenario:
          When a second scenario step
      """
    And the step "a background step" has a passing mapping
    And the step "a scenario step" has a passing mapping
    And the step "a second scenario step" has a passing mapping
    When Cucumber runs the feature
    Then the feature passes
    # todo: ensure the background step is called twice
    And the step "a background step" passes
    And the step "a scenario step" passes
    And the step "a second scenario step" passes

  # TODO: failing background steps, failing scenario steps...


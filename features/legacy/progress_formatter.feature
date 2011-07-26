Feature: progress formatter
  In order to get quick feedback when doing BDD
  As a developer
  I want to use a "progress" formatter

  Scenario: one scenario, one step, passing
    Given a step definition matching /a passing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
      """
    Then the listener should output the following:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      """

  Scenario: one scenario, two steps, passing
    Given a step definition matching /a passing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
          And a passing step
      """
    Then the listener should output the following:
      """
      ..

      1 scenario (1 passed)
      2 steps (2 passed)
      """

  Scenario: two scenarios, five steps, passing
    Given a step definition matching /a passing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
          And a passing step
        Scenario:
          Given a passing step
          And a passing step
          When a passing step
      """
    Then the listener should output the following:
      """
      ..

      2 scenarios (2 passed)
      5 steps (5 passed)
      """

  Scenario: one scenario, one step, failing
    Given a step definition failing with message "boom" matching /a failing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a failing step
      """
    Then the listener should output the following:
      """
      F

      1 scenario (1 failed)
      1 step (1 failed)
      """

  Scenario: one scenario, two steps, second failing
    Given a step definition matching /a passing step/
    And a step definition failing with message "boom" matching /a failing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
          When a failing step
      """
    Then the listener should output the following:
      """
      .F

      1 scenario (1 failed)
      2 steps (1 failed, 1 passed)
      """

  Scenario: one two-step passing scenario, one two-step scenario with latest step failing
    Given a step definition matching /a passing step/
    And a step definition failing with message "boom" matching /a failing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
          When a passing step
        Scenario:
          Given a passing step
          When a failing step
      """
    Then the listener should output the following:
      """
      ...F

      2 scenarios (1 failed, 1 passed)
      4 steps (1 failed, 3 passed)
      """

  Scenario: one failing scenario with a skipped step
    Given a step definition matching /a passing step/
    And a step definition matching /a skipped step/
    And a step definition failing with message "boom" matching /a failing step/
    When I run the following feature with the "progress" formatter:
      """
      Feature:
        Scenario:
          Given a passing step
          When a failing step
          Then a skipped step
      """
    Then the listener should output the following:
      """
      .F-

      1 scenario (1 failed)
      3 steps (1 failed, 1 skipped, 1 passed)
      """

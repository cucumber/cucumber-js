Feature: Multiple Formatters

  Background:
    Given a file named "features/a.feature" with:
      """
      Fonctionnalité: Bonjour
        Scénario: Monde
          Soit une étape
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^une étape$/, function() {})
      """

  Scenario: Ability to specify multiple formatters
    When I run cucumber-js with `--language fr`
    Then it outputs the text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

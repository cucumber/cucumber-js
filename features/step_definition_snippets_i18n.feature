Feature: step definition snippets i18n

  As a developer writing my features in another language
  I want my text snippets to reference the translation

  Background:
    Given a file named "features/undefined.feature" with:
      """
      # language: af
      Funksie: a feature
        Situasie: a scenario
          Gegewe undefined step A
          Wanneer undefined step B
          Dan undefined step C
      """

  Scenario:
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      Given('undefined step A', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });
      """
    And the output contains the text:
      """
      When('undefined step B', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });
      """
    And the output contains the text:
      """
      Then('undefined step C', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });
      """

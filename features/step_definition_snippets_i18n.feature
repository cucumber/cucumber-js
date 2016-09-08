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
    Then it outputs this text:
      """
      Funksie: a feature

        Situasie: a scenario
        ? Gegewe undefined step A
        ? Wanneer undefined step B
        ? Dan undefined step C

      Warnings:

      1) Scenario: a scenario - features/undefined.feature:3
         Step: Gegewe undefined step A - features/undefined.feature:4
         Message:
           Undefined. Implement with the following snippet:

             this.Given(/^undefined step A$/, function (callback) {
               // Write code here that turns the phrase above into concrete actions
               callback(null, 'pending');
             });

      2) Scenario: a scenario - features/undefined.feature:3
         Step: Wanneer undefined step B - features/undefined.feature:5
         Message:
           Undefined. Implement with the following snippet:

             this.When(/^undefined step B$/, function (callback) {
               // Write code here that turns the phrase above into concrete actions
               callback(null, 'pending');
             });

      3) Scenario: a scenario - features/undefined.feature:3
         Step: Dan undefined step C - features/undefined.feature:6
         Message:
           Undefined. Implement with the following snippet:

             this.Then(/^undefined step C$/, function (callback) {
               // Write code here that turns the phrase above into concrete actions
               callback(null, 'pending');
             });

      1 scenario (1 undefined)
      3 steps (3 undefined)
      <duration-stat>
      """

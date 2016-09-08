Feature: step definition snippets custom syntax

  As a developer writing my step definitions in another JS dialect
  I want to be able to see step definition snippets in the language I perfer

  Background:
    Given a file named "features/undefined.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given an undefined step
      """

  Scenario Outline:
    When I run cucumber-js with `--snippet-interface <INTERFACE>`
    Then it outputs this text:
      """
      Feature: a feature

        Scenario: a scenario
        ? Given an undefined step

      Warnings:

      1) Scenario: a scenario - features/undefined.feature:2
         Step: Given an undefined step - features/undefined.feature:3
         Message:
           Undefined. Implement with the following snippet:

             this.Given(/^an undefined step$/, <SNIPPET_FUNCTION_KEYWORD_AND_PARAMETERS> {
               // Write code here that turns the phrase above into concrete actions
               <SNIPPET_IMPLEMENTATION>;
             });

      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """

    Examples:
      | INTERFACE   | SNIPPET_FUNCTION_KEYWORD_AND_PARAMETERS | SNIPPET_IMPLEMENTATION    |
      | callback    | function (callback)                     | callback(null, 'pending') |
      | generator   | function *()                            | return 'pending'          |
      | promise     | function ()                             | return 'pending'          |
      | synchronous | function ()                             | return 'pending'          |

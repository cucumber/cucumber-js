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
    And a file named "coffeescript_syntax.js" with:
      """
      function CoffeeScriptSyntax(interface) {
        return {
          build: function build (functionName, pattern, parameters, comment) {
            var implementation;
            if (interface === 'callback') {
              var callbackName = parameters[parameters.length - 1];
              implementation = callbackName + ' null, \'pending\'';
            } else {
              parameters.pop();
              implementation = '\'pending\'';
            }
            var callbackName = parameters[parameters.length - 1];
            var parametersStr = parameters.length > 0 ? '(' + parameters.join(', ') + ') ' : '';
            var snippet =
              '@' + functionName + ' ' + pattern + ', ' + parametersStr + '-> ' + '\n' +
              '  # ' + comment + '\n' +
              '  ' + implementation;
            return snippet;
          }
        };
      }

      module.exports = CoffeeScriptSyntax;
      """

  Scenario Outline:
    When I run cucumber-js with `--snippet-interface <INTERFACE> --snippet-syntax coffeescript_syntax.js`
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

             @Given /^an undefined step$/, <SNIPPET_PARAMETERS_AND_ARROW>
               # Write code here that turns the phrase above into concrete actions
               <SNIPPET_IMPLEMENTATION>

      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """

    Examples:
      | INTERFACE   | SNIPPET_PARAMETERS_AND_ARROW | SNIPPET_IMPLEMENTATION   |
      | callback    | (callback) ->                | callback null, 'pending' |
      | generator   | ->                           | 'pending'                |
      | promise     | ->                           | 'pending'                |
      | synchronous | ->                           | 'pending'                |

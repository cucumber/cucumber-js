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
      function CoffeeScriptSyntax(snippetInterface) {
        return {
          build: function build (functionName, pattern, parameters, comment) {
            var implementation;
            if (snippetInterface === 'callback') {
              var callbackName = parameters[parameters.length - 1];
              implementation = callbackName + ' null, \'pending\'';
            } else {
              parameters.pop();
              implementation = '\'pending\'';
            }
            var callbackName = parameters[parameters.length - 1];
            var parametersStr = parameters.length > 0 ? '(' + parameters.join(', ') + ') ' : '';
            var snippet =
              '@' + functionName + ' \'' + pattern.replace(/'/g, '\\\'') + '\', ' + parametersStr + '-> ' + '\n' +
              '  # ' + comment + '\n' +
              '  ' + implementation;
            return snippet;
          }
        };
      }

      module.exports = CoffeeScriptSyntax;
      """

  Scenario Outline:
    When I run cucumber-js with `--format-options '{"snippetInterface": "<INTERFACE>", "snippetSyntax": "coffeescript_syntax.js"}'`
    Then the output contains the text:
      """
      @Given 'an undefined step', <SNIPPET_PARAMETERS_AND_ARROW>
        # Write code here that turns the phrase above into concrete actions
        <SNIPPET_IMPLEMENTATION>
      """

    Examples:
      | INTERFACE   | SNIPPET_PARAMETERS_AND_ARROW | SNIPPET_IMPLEMENTATION   |
      | callback    | (callback) ->                | callback null, 'pending' |
      | generator   | ->                           | 'pending'                |
      | promise     | ->                           | 'pending'                |
      | synchronous | ->                           | 'pending'                |

Feature: step definition snippets custom syntax

  As a developer writing my step definitions in another JS dialect
  I want to be able to see step definition snippets in the language I prefer

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
          build: function build (opts) {
            var implementation;
            if (snippetInterface === 'callback') {
              implementation = "done null, 'pending'";
            } else {
              implementation = "'pending'";
            }
            var definitionChoices = opts.generatedExpressions.map(
              function (generatedExpression, index) {
                var prefix = index === 0 ? '' : '# ';
                var allParameterNames = generatedExpression.parameterNames.concat(opts.stepParameterNames);
                if (snippetInterface === 'callback') {
                  allParameterNames.push('done');
                }
                var parametersStr = allParameterNames.length > 0 ? '(' + allParameterNames.join(', ') + ') ' : '';
                return prefix + '@' + opts.functionName + " '" + generatedExpression.source.replace(/'/g, '\\\'') + "', " + parametersStr + '-> \n';
              }
            )
            return (
              definitionChoices.join('') +
              '  # ' + opts.comment + '\n' +
              '  ' + implementation
            );
          }
        };
      }

      module.exports = CoffeeScriptSyntax;
      """

  Scenario Outline:
    When I run cucumber-js with `--format-options '{"snippetInterface": "<INTERFACE>", "snippetSyntax": "./coffeescript_syntax.js"}'`
    Then it fails
    And the output contains the text:
      """
      @Given 'an undefined step', <SNIPPET_PARAMETERS_AND_ARROW>
        # Write code here that turns the phrase above into concrete actions
        <SNIPPET_IMPLEMENTATION>
      """

    Examples:
      | INTERFACE   | SNIPPET_PARAMETERS_AND_ARROW | SNIPPET_IMPLEMENTATION |
      | callback    | (done) ->                    | done null, 'pending'   |
      | generator   | ->                           | 'pending'              |
      | promise     | ->                           | 'pending'              |
      | async-await | ->                           | 'pending'              |
      | synchronous | ->                           | 'pending'              |

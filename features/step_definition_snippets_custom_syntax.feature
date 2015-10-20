Feature: step definition snippets custom syntax

  As a developer writing my step definitions in another JS dialect
  I want to be able to see step definition snippets in the language I perfer

  Scenario:
    Given a file named "features/undefined.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given an undefined step
      """
    And a file named "coffeescript_syntax.js" with:
      """
      function CoffeeScriptSyntax() {
        return {
          build: function build (functionName, pattern, parameters, comment) {
            var callbackName = parameters[parameters.length - 1];
            var snippet =
              '@' + functionName + ' ' + pattern + ', (' + parameters.join(', ') + ') -> ' + '\n' +
              '  # ' + comment + '\n' +
              '  ' + callbackName + '.pending()' + '\n' +
              '\n';
            return snippet;
          }
        };
      }

      module.exports = CoffeeScriptSyntax;
      """
    When I run cucumber-js with `--snippet-syntax coffeescript_syntax.js`
    Then the output contains the text:
      """
      @Given /^an undefined step$/, (callback) ->
        # Write code here that turns the phrase above into concrete actions
        callback.pending()
      """

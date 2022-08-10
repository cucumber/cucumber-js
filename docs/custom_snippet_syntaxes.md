# Custom Snippet Syntaxes

* See the [JavaScript syntax](/src/formatter/step_definition_snippet_builder/javascript_snippet_syntax.ts) and the [custom snippet syntax](/features/step_definition_snippets_custom_syntax.feature) for examples.
  * Arguments passed to the constructor:
    * `snippetInterface` - string equal to one of the following: 'async-await', 'callback', 'generator', 'promise', or 'synchronous'
  * Arguments passed to `build` method:
    * An object with the following keys:
      * `comment`: a comment to be placed at the top of the function
      * `functionName`: the function name to use for the snippet
      * `generatedExpressions`: from [cucumber-expressions](https://github.com/cucumber/cucumber-expressions#readme). In most cases will be an array of length 1. But there may be multiple. If multiple, please follow the behavior of the javascript syntax in presenting each of them. See the "multiple patterns" test in this [file](/src/formatter/step_definition_snippet_builder/javascript_snippet_syntax_spec.ts).
      * `stepParameterNames`: names for the doc string or data table parameter when applicable. Theses should be appended to the parameter names of each generated expressions.
* Please add the keywords `cucumber` and `snippets` to your package, so it can easily be found by searching [npm](https://www.npmjs.com/search?q=cucumber+snippets).
* Please open an issue if you would like more information.

# Snippets

Often in a BDD workflow, you'll write one or more steps in a feature file _before_ implementing the corresponding step definition(s). When you run cucumber-js and it finds these undefined steps, it will generate a Snippet for each one - a skeletal chunk of JavaScript with the correct expression and arguments that you can drop into your code to get started. [Formatters](./formatters.md) that are designed for the terminal will output the snippets.

Let's say we're iterating on this feature:

```gherkin
Feature: Removing todos

  Scenario: Add and then remove a todo from an empty list
    Given an empty todo list
    When I add the todo "buy some cheese"
    And I remove the todo "buy some cheese"
```

The last step about removing todos isn't implemented yet - we just wrote that into the scenario, so now it's time to write the step definition. If we run cucumber-js, it will announce the undefined step and provide the Snippet in the output:

```js
Then('I remove the todo {string}', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});
```

By default, the snippet uses the "synchronous" style. You can use the `snippetInterface` [format option](./formatters.md#options) to specify one of the styles that supports asynchronous steps:

- "async-await" - Outputs an async function where you can use `await` - probably the best choice if you aren't sure.
  Running with `--format-options '{"snippetInterface":"async-await"}'` yields:
  ```js
  Then('I remove the todo {string}', async function (string) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
  });
  ```
- "callback" - Outputs a plain function with a callback function as the final argument.
  Running with `--format-options '{"snippetInterface":"callback"}'` yields:
  ```js
  Then('I remove the todo {string}', function (string, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback(null, 'pending');
  });
  ```
- "promise" - Outputs a plain function from which you should return a `Promise`.
  Running with `--format-options '{"snippetInterface":"promise"}'` yields:
  ```js
  Then('I remove the todo {string}', function (string) {
    // Write code here that turns the phrase above into concrete actions
    return Promise.resolve('pending');
  });
  ```
- "synchronous" - Outputs a plain function with no async pattern (see earlier example).

## Options

These [format options](./formatters.md#options) influence how the snippets are rendered by all formatters that output snippets:

- `snippetInterface` - set to one of 'async-await', 'callback', 'promise', or 'synchronous' to alter the style of generated snippets for undefined steps
- `snippetSyntax` - module name of path of the [custom snippet syntax](./custom_snippet_syntaxes.md) to be used



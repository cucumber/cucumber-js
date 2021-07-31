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



## Options

- `snippetInterface` - set to one of 'async-await', 'callback', 'generator', 'promise', or 'synchronous' to alter the style of generated snippets for undefined steps
- `snippetSyntax`



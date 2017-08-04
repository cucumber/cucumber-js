# Support Files

## API Reference

The function passed to `defineSupportCode` is called with an object as the first argument that exposes the following methods:

---

#### `defineParameterType({regexp, typeName, transformer})`

Add a new transform to convert a capture group into something else.

* `regexp`: A regular expression (or array of regular expressions) that match the parameter
* `typeName`: string used to refer to this type in cucumber expressions
* `transformer`: An optional function which transforms the captured argument from a string into what is passed to the step definition.
  If no transform function is specified, the captured argument is left as a string.
  The function can be synchronous or return a `Promise` of the transformed value.

The built in transforms are:

```javascript
// Float
{
  regexp: /-?\d*\.?\d+/,
  transformer: parseFloat,
  typeName: 'float'
}

// Integer
{
  regexp: /-?\d+/,
  transformer: parseInt,
  typeName: 'int'
}

// String in double quotes
{
  regexp: /"[^"]+"/,
  transformer: JSON.parse,
  typeName: 'stringInDoubleQuotes'
}
```

---

#### `After([options,] fn)`

Defines a hook which is run after each scenario.

* `options`: An object with the following keys:
  * `tags`: string tag expression used to apply this hook to only specific scenarios. See [cucumber-tag-expressions](https://docs.cucumber.io/tag-expressions/) for more information
  * `timeout`: A hook-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  * The first argument will be a [ScenarioResult](/src/models/scenario_result.js)
  * When using the asynchronous callback interface, have one final argument for the callback function.

`options` can also be a string as a shorthand for specifying `tags`.

Multiple `After` hooks are executed in the **reverse** order that they are defined.

---

#### `AfterAll([options,] fn)`

Defines a hook which is run after all scenarios have completed.

* `options`: An object with the following keys:
  * `timeout`: A hook-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  * When using the asynchronous callback interface, have one argument for the callback function.

Multiple `AfterAll` hooks are executed in the **reverse** order that they are defined.

---

#### `Before([options,] fn)`

Defines a hook which is run before each scenario. Same interface as `After`.

Multiple `Before` hooks are executed in the order that they are defined.

---

#### `BeforeAll([options,] fn)`

Defines a hook which is run before all scenarios. Same interface as `AfterAll`.

Multiple `BeforeAll` hooks are executed in the order that they are defined.

---

#### `defineStep(pattern[, options], fn)`

Defines a step.

Aliases: `Given`, `When`, `Then`.

* `pattern`: A regex or string pattern to match against a gherkin step.
* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
  - `wrapperOptions`: step-specific options that are passed to the definition function wrapper
* `fn`: A function, which should be defined as follows:
  - Should have one argument for each capture in the regular expression.
  - May have an additional argument if the gherkin step has a docstring or data table.
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `Given(pattern[, options], fn)`

Alias of `defineStep`.

---

#### `setDefaultTimeout(milliseconds)`

Set the default timeout for asynchronous steps. Defaults to `5000` milliseconds.

---

#### `setDefinitionFunctionWrapper(fn, options)`

Set a function used to wrap step / hook definitions. When used, the result is wrapped again to ensure it has the same length of the original step / hook definition. `options` is the step specific `wrapperOptions` and may be undefined.

---

#### `setWorldConstructor(constructor)`

Set a custom world constructor, to override the default world constructor:

```javascript
function World({attach, parameters}) {
  this.attach = attach
  this.parameters = parameters
}
```

* `attach` - a function hooks / steps can use to add [attachments](./attachments.md)
* `parameters` - world parameters passed in through the [cli](../cli.md#world-parameters)

**Note:** The World constructor was made strictly synchronous in *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*.

---

#### `Then(pattern[, options], fn)`

Alias of `defineStep`.

---

#### `When(pattern[, options], fn)`

Alias of `defineStep`.

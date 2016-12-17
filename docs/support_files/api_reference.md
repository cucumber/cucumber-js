# Support Files

## API Reference

Each call to `defineSupportCode` is passed an object with the following methods:

---

#### `addTransform({captureGroupRegexps, name, transformer})`

Add a new transform to convert a capture group into something else.

* `captureGroupRegexps`: An array of regular expressions to apply the transformer to
* `transformer`: A function which transforms the captured group from a string into what is passed to the step definition
* `typeName`: string used to refer to this type in cucumber expressions

The built in transforms are:
```js
// Float
{
  captureGroupRegexps: ['-?\\d*\\.?\\d+'],
  transformer: parseFloat,
  typeName: 'float'
}

// Int
{
  captureGroupRegexps: ['-?\\d+'],
  transformer: parseInt,
  typeName: 'int'
}

// String in double quotes
{
  captureGroupRegexps: ['"[^"]*"'],
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
  * string as a shorthand for specifying `tags`
* `fn`: A function, defined as follows:
  * The first argument will be a [ScenarioResult](/src/models/scenario_result.js)
  * When using the asynchronous callback interface, have one final argument for the callback function.

If `options` is a string then it specifies the `tags`

Multiple `After` hooks are executed in the **reverse** order that they are defined.

---

#### `Before([options,] fn)`

Defines a hook which is run before each scenario. Same interface as `After`.

Multiple `Before` hooks are executed in the order that they are defined.

---

#### `defineStep([options,] pattern, fn)`

Defines a step.

Aliases: `Given`, `When`, `Then`.

* `pattern`: A regex or string pattern to match against a gherkin step.
* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
* `fn`: A function, which should be defined as follows:
  - Should have one argument for each capture in the regular expression.
  - May have an additional argument if the gherkin step has a docstring or data table.
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `Given(pattern[, options], fn)`

Alias of `defineStep`.

---

#### `registerHandler(event[, options], fn)`

* `event`: One of the supported event names [listed here](./event_handlers.md).
* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  - The first argument is the object as defined [here](./event_handlers.md).
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `setDefaultTimeout(milliseconds)`

Set the default timeout for asynchronous steps. Defaults to `5000` milliseconds.

---

#### `setDefinitionFunctionWrapper(fn)`

Set a function used to wrap step / hook definitions. When used, the result is wrapped again to ensure it has the same length of the original step / hook definition.

---

#### `setWorldConstructor(constructor)`

Set a custom world constructor, to override the default world constructor:
```js
function World({attach, parameters}) {
  attach = attach
  parameters = parameters
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

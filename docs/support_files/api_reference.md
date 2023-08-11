# Support Files

## API Reference

Each method can be destructed from the object returned by `require('@cucumber/cucumber')`.

---

#### `defineParameterType({name, preferForRegexpMatch, regexp, transformer, useForSnippets})`

Define a new parameter type and optionally convert an output parameter into something else.

* `name`: String used to refer to this type in cucumber expressions.
* `regexp`: A regular expression (or array of regular expressions) that match the parameter.
* `transformer`: An optional function which transforms the captured argument from a string into what is passed to the step definition.
  If no transform function is specified, the captured argument is left as a string.
  The function can be synchronous or return a `Promise` of the transformed value. The value of `this` is the current world, so the function can delegate to world functions.
  Note that your transformer functions cannot reference the [world](./world.md) as `this` if you use
  arrow functions. See [FAQ](../faq.md) for details.
* `useForSnippets`: Defaults to `true`. That means this parameter type will be used to generate snippets for undefined steps. If the `regexp` frequently matches text you don't intend to be used as arguments, disable its use for snippets with `false`.
* `preferForRegexpMatch`: Defaults to `false`. Set to `true` if you use regular expressions and you want this parameter type's `regexp` to take precedence over others during a match.

The built in parameter types are:
* `int`
* `float`
* `string`
  * contained in single or double quotes
  * the transformer removes the quotes
* `word`

---

#### `After([options,] fn)`

Defines a hook which is run after each scenario.

* `options`: An object with the following keys:
  * `name`: An optional name for this hook
  * `tags`: String tag expression used to apply this hook to only specific scenarios. See [cucumber-tag-expressions](https://github.com/cucumber/tag-expressions) for more information.
  * `timeout`: A hook-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  * The first argument will be an object of the form `{pickle, gherkinDocument, result, willBeRetried, testCaseStartedId}`
    * The pickle object comes from the [gherkin](https://github.com/cucumber/cucumber/tree/gherkin/v15.0.2/gherkin) library. See `testdata/good/*.pickles.ndjson` for examples of its structure.
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

#### `AfterStep([options,] fn)`

Defines a hook which is run after each step.

* `options`: An object with the following keys:
  * `tags`: String tag expression used to apply this hook to only specific scenarios. See [cucumber-tag-expressions](https://github.com/cucumber/tag-expressions) for more information.
  * `timeout`: A hook-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  * The first argument will be an object of the form `{pickle, pickleStep, gherkinDocument, result, testCaseStartedId, testStepId}`
    * The `pickle` object comes from the [gherkin](https://github.com/cucumber/cucumber/tree/gherkin/v15.0.2/gherkin) library. See `testdata/good/*.pickles.ndjson` for examples of its structure.
    * The `pickleStep` is the step in the `pickle` that this hook has been invoked for
  * When using the asynchronous callback interface, have one final argument for the callback function.

`options` can also be a string as a shorthand for specifying `tags`.

Multiple `AfterStep` hooks are executed in the **reverse** order that they are defined.

---

#### `Before([options,] fn)`

Defines a hook which is run before each scenario. Same interface as `After` except the first argument passed to `fn` will not have the `result` property.

Multiple `Before` hooks are executed in the order that they are defined.

---

#### `BeforeAll([options,] fn)`

Defines a hook which is run before all scenarios. Same interface as `AfterAll`.

Multiple `BeforeAll` hooks are executed in the order that they are defined.

---

#### `BeforeStep([options,] fn)`

Defines a hook which is run before each step. Same interface as `AfterStep` except the first argument passed to `fn` will not have the `result` property.

Multiple `BeforeStep` hooks are executed in the order that they are defined.

---

#### `Given(pattern[, options], fn)`

Define a "Given" step.

Aliases: `defineStep` (deprecated and will be removed in a future release; use the appropriate Given/When/Then keyword to define your step).

* `pattern`: A regex or string pattern to match against a gherkin step.
* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
  - `wrapperOptions`: Step-specific options that are passed to the definition function wrapper.
* `fn`: A function, which should be defined as follows:
  - Should have one argument for each capture in the regular expression.
  - May have an additional argument if the gherkin step has a docstring or data table.
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `setDefaultTimeout(milliseconds)`

Set the default timeout for asynchronous steps. Defaults to `5000` milliseconds.

---

#### `setDefinitionFunctionWrapper(wrapper)`

_Note: the usage of `setDefinitionFunctionWrapper` is discouraged in favor of [BeforeStep](#beforestepoptions-fn) and [AfterStep](#afterstepoptions-fn) hooks._

Set a function used to wrap step / hook definitions.

The `wrapper` function is expected to take 2 arguments:

- `fn` is the original function defined for the step - needs to be called in order for the step to be run.
- `options` is the step specific `wrapperOptions` and may be undefined.

Example:

```javascript
setDefinitionFunctionWrapper(function(fn, options) {
  return function(...args) {
    // call original function with correct `this` and arguments
    // ensure return value of function is returned
    return fn.apply(this, args)
      .catch(error => {
        // rethrow error to avoid swallowing failure
        throw error;
      });
  }
})
```

When used, the result is wrapped again to ensure it has the same length of the original step / hook definition.

---

### setParallelCanAssign(canAssignFn)

Set the function used to determine if a pickle can be executed based on currently executing pickles.

The `canAssignFn` function is expected to take 2 arguments:

- `pickleInQuestion` is the a pickle we are checking if its okay to run
- `picklesInProgress` is an array of pickles currently being executed

And returns true if the pickle can be executed, false otherwise.

See examples in our [parallel](../parallel.md) documentation.

---

#### `setWorldConstructor(constructor)`

Set a custom world constructor, to override the default world constructor:

```javascript
function World({attach, parameters}) {
  this.attach = attach;
  this.parameters = parameters;
}
```

* `attach` - a function hooks / steps can use to add [attachments](./attachments.md)
* `parameters` - world parameters passed in through the [cli](../cli.md#world-parameters)

**Note:** The World constructor was made strictly synchronous in *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*.

---

#### `Then(pattern[, options], fn)`

Define a "Then" step. Same interface as `Given`

---

#### `When(pattern[, options], fn)`

Define a "When" step. Same interface as `Given`

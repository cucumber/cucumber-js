# Support Files

## API Reference

All support files that export a function will be called with a context that exposes the following methods:

---

#### `this.After([options,] fn)`

Defines a hook which is run after each scenario.

* `options`: An object with the following keys:
  - `tags`: An array of tags used to apply this hook to only specific scenarios.
  - `timeout`: A hook-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  - The first argument will be the current running scenario.
    (See [`Cucumber.Api.Scenario`](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/api/scenario.js) for more information.)
  - When using the asynchronous callback interface, have one final argument for the callback function.

Multiple `After` hooks are executed in the **reverse** order that they are defined.

---

#### `this.Before([options,] fn)`

Defines a hook which is run before each scenario. Same interface as `this.After`.

Multiple `Before` hooks are executed in the order that they are defined.

---

#### `this.defineStep([options,] pattern, fn)`

Defines a step.

Aliases: `this.Given`, `this.When`, `this.Then`.

* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
* `pattern`: A regex or string pattern to match against a gherkin step.
* `fn`: A function, which should be defined as follows:
  - Should have one argument for each capture in the regular expression. 
  - May have an additional argument if the gherkin step has a docstring or data table. 
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `this.Given([options,] pattern, fn)`

Alias of `this.defineStep`.

---

#### `this.registerHandler(event, [options,] fn)`

* `event`: One of the supported event names [listed here](./event_handlers.md).
* `options`: An object with the following keys:
  - `timeout`: A step-specific timeout, to override the default timeout.
* `fn`: A function, defined as follows:
  - The first argument is the object as defined [here](./event_handlers.md). 
  - When using the asynchronous callback interface, have one final argument for the callback function.

---

#### `this.setDefaultTimeout(milliseconds)`

Set the default timeout for asynchronous steps. Defaults to `5000` milliseconds.

---

#### `this.Then([options,] pattern, fn)`

Alias of `this.defineStep`.

---

#### `this.When([options,] pattern, fn)`

Alias of `this.defineStep`.

---

#### `this.World`

Set a custom world constructor, to override the default world constructor (`function () {}`).

**Note:** The World constructor was made strictly synchronous in *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*.

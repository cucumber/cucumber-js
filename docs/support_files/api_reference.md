# Support Files

## API Reference

All support files that export a function will be
called with a context that exposes the following methods:

---

#### this.After([options,] code)

Defines a hook which is run after each scenario.

* `options` - object with the following keys
  * `tags` - array of tags used to apply this hook to only specific scenarios
  * `timeout` - hook specific timeout to override the default timeout
* `code` - a javascript function. The first argument will be the current running scenario.
  See [Cucumber.Api.Scenario](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/api/scenario.js)
  for more information. May optionally take an additional argument if using the asynchronous callback interface.

Multiple *After* hooks are executed in the **reverse** order that they were defined.

---

#### this.Before([options,] code)

Defines a hook which is run before each scenario. Same interface as *this.After*.
Multiple *Before* hooks are executed in the order that they were defined.

---

#### this.defineStep([options,] pattern, code)

Defines a step. *Aliases: this.Given, this.When, this.Then*

* `options` - object with the following keys
  * `timeout` - step specific timeout to override the default timeout
* `pattern` - regex or string pattern to match against a gherkin step
* `code` - a javascript function. Should have one argument for each capture in the
  regular expression. May have an additional argument if the gherkin step has
  a doc string or data table. Finally may optionally take an additional argument
  as a callback if using that interface.

---

#### this.Given([options,] pattern, code)

Alias of *this.defineStep*

---

#### this.registerHandler(event, [options,] code)

* `event` - one of the supported event names listed [here](./event_handlers.md)
* `options` - object with the following keys
  * `timeout` - step specific timeout to override the default timeout
* `code` - a javascript function. The first argument is the object as defined [here](./event_handlers.md). May optionally take an additional argument
  as a callback if using that interface.

---

#### this.setDefaultTimeout(milliseconds)

Set the default timeout for asynchronous steps. Default is `5000` milliseconds.

---

#### this.Then([options,] pattern, code)

Alias of *this.defineStep*

---

#### this.When([options,] pattern, code)

Alias of *this.defineStep*

---

#### this.World

Set to a custom world constructor to override the default (`function () {}`).

**Note:** The World constructor was made strictly synchronous in *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*.

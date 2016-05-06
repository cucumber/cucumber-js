# Cucumber.js

[![Build Status](https://travis-ci.org/cucumber/cucumber-js.svg?branch=master)](https://travis-ci.org/cucumber/cucumber-js)
[![Dependencies](https://david-dm.org/cucumber/cucumber-js.svg)](https://david-dm.org/cucumber/cucumber-js)
[![Code Climate](https://codeclimate.com/github/cucumber/cucumber-js.svg)](https://codeclimate.com/github/cucumber/cucumber-js)

[Cucumber](https://cucumber.io) is a tool for running automated tests written in plain language. Because they're
written in plain language, they can be read by anyone on your team. Because they can be
read by anyone, you can use them to help improve communication, collaboration and trust on
your team.

Cucumber.js is the JavaScript implementation of Cucumber and runs on both Node.js and *modern* web browsers.

## Try it now

We've put a demo of Cucumber.js to [run in your browser](http://cucumber.github.io/cucumber-js/). Why don't you give it a try before anything else?

## Help & support

* Chat: [Gitter](https://gitter.im/cucumber/cucumber-js)
* Google Groups: [cukes](https://groups.google.com/group/cukes)
* Website: [cucumber.io](https://cucumber.io)
* Twitter: [@cucumberbdd](https://twitter.com/cucumberbdd/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for info on contributing to Cucumber.js.

## Code of Conduct

Everyone interacting in this codebase and issue tracker is expected to follow the Cucumber [code of conduct](https://github.com/cucumber/cucumber/blob/master/CODE_OF_CONDUCT.md).

## Install

### Node

Cucumber.js is available as an npm module.

``` shell
$ npm install cucumber
```

### Browser

* Grab the latest browserified code from the [release](/release) folder

## Usage

### Features

Features are written with the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin)

``` gherkin
# features/my_feature.feature

Feature: Example feature
  As a user of Cucumber.js
  I want to have documentation on Cucumber
  So that I can concentrate on building awesome applications

  Scenario: Reading documentation
    Given I am on the Cucumber.js GitHub repository
    When I go to the README file
    Then I should see "Usage" as the page title
```

### Support files

Support files let you setup the environment in which steps will be run, and define step definitions.

#### World

*World* is a constructor function with utility properties, destined to be used in step definitions:

```javascript
// features/support/world.js
var zombie = require('zombie');
function World() {
  this.browser = new zombie(); // this.browser will be available in step definitions

  this.visit = function (url, callback) {
    this.browser.visit(url, callback);
  };
}

module.exports = function() {
  this.World = World;
};
```

If you need to perform operations before/after every scenario, use [hooks](#hooks).

**Breaking Change:** The World constructor is now strictly synchronous and does not receive a callback from Cucumber anymore... This is a breaking change that was introduced in release *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*

#### Step definitions

Step definitions are the glue between features written in Gherkin and the actual system under test. They are written in JavaScript.

All step definitions will run with `this` set to what is known as the *[World](https://github.com/cucumber/cucumber/wiki/A-Whole-New-World)* in Cucumber. It's an object exposing useful methods, helpers and variables to your step definitions. A new instance of `World` is created before each scenario.

Step definitions are contained within one or more wrapper functions.

Those wrappers are run before executing the feature suite. `this` is an object holding important properties like the `Given()`, `When()` and `Then()` functions. Another notable property is `World`; it contains a default `World` constructor that can be either extended or replaced.

Step definitions are run when steps match their name. `this` is an instance of `World`.

``` javascript
// features/step_definitions/my_step_definitions.js

module.exports = function () {
  this.Given(/^I am on the Cucumber.js GitHub repository$/, function (callback) {
    // Express the regexp above with the code you wish you had.
    // `this` is set to a World instance.
    // i.e. you may use this.browser to execute the step:

    this.visit('https://github.com/cucumber/cucumber-js', callback);

    // The callback is passed to visit() so that when the job's finished, the next step can
    // be executed by Cucumber.
  });

  this.When(/^I go to the README file$/, function (callback) {
    // Express the regexp above with the code you wish you had. Call callback() at the end
    // of the step, or callback(null, 'pending') if the step is not yet implemented:

    callback(null, 'pending');
  });

  this.Then(/^I should see "(.*)" as the page title$/, function (title, callback) {
    // matching groups are passed as parameters to the step definition

    var pageTitle = this.browser.text('title');
    if (title === pageTitle) {
      callback();
    } else {
      callback(new Error("Expected to be on page with title " + title));
    }
  });
};
```

##### Promises

Instead of Node.js-style callbacks, promises can be returned by step definitions:

``` javascript
this.Given(/^I am on the Cucumber.js GitHub repository$/, function () {
  // Notice how `callback` is omitted from the parameters
  return this.visit('https://github.com/cucumber/cucumber-js');

  // A promise, returned by zombie.js's `visit` method is returned to Cucumber.
});
```

Simply omit the last `callback` parameter and return the promise.

If the promise resolves to the string `'pending'`, the step will be marked as pending.

##### Synchronous step definitions

Often, asynchronous behaviour is not needed in step definitions. Simply omit the callback parameter, do not return anything and Cucumber will treat the step definition function as synchronous:

``` javascript
this.Given(/^I add one cucumber$/, function () {
  // Notice how `callback` is omitted from the parameters
  this.cucumberCount += 1;
});

```

If the step returns the string `'pending'`, the step will be marked as pending.

##### Generators (ES6)

If your language supports generator functions, you can define step definitions with generator functions

```javascript
this.When(/^I add one cucumber$/, function *() {
  this.cucumberCount += yield 1;
});
```

##### Strings instead of regular expressions

It is also possible to use simple strings instead of regexps as step definition patterns:

```javascript
this.Then('I should see "$title" as the page title', function (title, callback) {
  // the above string is converted to the following Regexp by Cucumber:
  // /^I should see "([^"]*)" as the page title$/

  var pageTitle = this.browser.text('title');
  if (title === pageTitle) {
    callback();
  } else {
    callback(new Error("Expected to be on page with title " + title));
  }
});
```

`'I have $count "$string"'` would translate to `/^I have (.*) "([^"]*)"$/`.

##### Data table

When steps have a data table, they are passed an object with methods that can be used to access the data.

- with column headers
  - `hashes`: returns an array of objects where each row is converted to an object (column header is the key)
  - `rows`: returns the table as a 2-D array, without the first row
- without column headers
  - `raw`: returns the table as a 2-D array
  - `rowsHash`: returns an object where each row corresponds to an entry (first column is the key, second column is the value)

See this [feature](/features/data_tables.feature) for examples

##### Timeouts

By default, asynchronous hooks and steps timeout after 5000 milliseconds.
This can be modified globally with:

```js
// features/support/env.js

var configure = function () {
  this.setDefaultTimeout(60 * 1000);
};

module.exports = configure;
```

A specific step's timeout can be set with:

```js
// features/step_definitions/my_steps.js

var mySteps = function () {
  this.Given(/^a slow step$/, {timeout: 60 * 1000}, function(callback) {
    // Does some slow browser/filesystem/network actions
  });
};

module.exports = mySteps;
```

#### Hooks

Hooks can be used to prepare and clean the environment before and after each scenario is executed.
Hooks can use callbacks, return promises, or be synchronous.
The first argument to hooks is always the current scenario. See
[Cucumber.Api.Scenario](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/api/scenario.js)
for more information.

##### Before hooks

To run something before every scenario, use before hooks:

``` javascript
// features/support/hooks.js (this path is just a suggestion)

var myHooks = function () {
  this.Before(function (scenario) {
    // Just like inside step definitions, "this" is set to a World instance.
    // It's actually the same instance the current scenario step definitions
    // will receive.

    // Let's say we have a bunch of "maintenance" methods available on our World
    // instance, we can fire some to prepare the application for the next
    // scenario:

    this.bootFullTextSearchServer();
    this.createSomeUsers();
  });
};

module.exports = myHooks;
```

If you need to run asynchronous code, simply accept a callback in your hook function and run it when you're done:

``` javascript
this.Before(function (scenario, callback) {
  this.createUsers(callback);
});
```

Or return a promise:

```javascript
this.Before(function (scenario) {
  // assuming this.createUsers returns a promise:
  return this.createUsers();
});
```

##### After hooks

The *before hook* counterpart is the *after hook*. It's similar in shape but is executed, well, *after* every scenario:

```javascript
// features/support/after_hooks.js

var myAfterHooks = function () {
  this.After(function (scenario) {
    // Again, "this" is set to the World instance the scenario just finished
    // playing with.

    // We can then do some cleansing:

    this.emptyDatabase();
    this.shutdownFullTextSearchServer();
  });
};

module.exports = myAfterHooks;
```

##### Tagged hooks

Hooks can be conditionally selected for execution based on the tags of the scenario.

``` javascript
// features/support/hooks.js (this path is just a suggestion)

var myHooks = function () {
  this.Before({tags: ["@foo", "@bar,@baz"]}, function (scenario) {
    // This hook will be executed before scenarios tagged with @foo and either
    // @bar or @baz.

    // ...
  });
};

module.exports = myHooks;
```

##### Hook timeouts

Hooks timeout the same as steps and a specific hooks's timeout can be set with:

```js
// features/step_definitions/hooks.js

var myHooks = function () {
  this.Before({timeout: 60 * 1000}, function (scenario) {
    // Does some slow initialization
  });
};

module.exports = myHooks;
```

##### Attachments

You can attach text, images and files to the Cucumber report using the scenario object:

``` javascript
this.After(function (scenario) {
  scenario.attach('Some text');
});
```

By default, text is saved with a MIME type of `text/plain`.  You can also specify
a different MIME type:

``` javascript
this.After(function (scenario) {
  scenario.attach('{"name": "some JSON"}', 'application/json');
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html). In that case, passing a callback to `attach()` becomes mandatory:

``` javascript
this.After(function (scenario, callback) {
  if (scenario.isFailed()) {
    var stream = getScreenshotOfError();
    scenario.attach(stream, 'image/png', function(err) {
      callback(err);
    });
  }
  else {
    callback();
  }
});
```

Images and binary data can also be attached using a [Buffer](https://nodejs.org/api/buffer.html):

``` javascript
this.After(function (scenario) {
  if (scenario.isFailed()) {
    var buffer = getScreenshotOfError();
    scenario.attach(buffer, 'image/png');
  }
});
```

Here is an example of saving a screenshot using [WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

``` javascript
this.After(function (scenario, callback) {
  if (scenario.isFailed()) {
    webDriver.takeScreenshot().then(stream) {
      scenario.attach(stream, 'image/png', callback);
    }, function(err) {
      callback(err);
    });
  }
  else {
    callback();
  }
});
```

##### After features event

The *after features event* is emitted once all features have been executed, just before the process exits. It can be used for tasks such as closing your browser after running automated browser tests with [selenium](https://code.google.com/p/selenium/wiki/WebDriverJs) or [phantomjs](http://phantomjs.org/).

note: There are "Before" and "After" events for each of the following: "Features", "Feature", "Scenario", "Step" as well as the standalone events "Background" and "StepResult". e.g. "BeforeScenario".

```javascript
// features/support/after_hooks.js
var myAfterHooks = function () {
  this.registerHandler('AfterFeatures', function (event, callback) {
    // clean up!
    // Be careful, there is no World instance available on `this` here
    // because all scenarios are done and World instances are long gone.
    callback();
  });
}

module.exports = myAfterHooks;
```

### CLI

Cucumber.js includes a executable file to run the features.

If you installed Cucumber.js globally, you may run it with:

``` shell
$ cucumber.js
```

If you installed Cucumber locally, you may need to specify the path to the executable:

``` shell
$ ./node_modules/.bin/cucumber.js
```

**Note to Windows users:** invoke Cucumber.js with `cucumber-js` instead of `cucumber.js`. The latter is causing the operating system to invoke JScript instead of Node.js, because of the file extension.

#### Running specific features

* Specify a feature file
  * `$ cucumber.js features/my_feature.feature`
* Specify a scenario by its line number
  * `$ cucumber.js features/my_feature.feature:3`
* Specify a scenario by its name matching a regular expression
  * `$ cucumber.js --name "topic 1"`
  * If used multiple times, the scenario name needs to match only one of the names supplied
* Use [Tags](#tags)

#### Requiring support files

Use `--require <FILE|DIR>` to require files before executing the features.
If not used, all "*.js" files (and other extensions specifed by `--compiler`) that are siblings
or below the features will be loaded automatically. Automatic
loading is disabled when this option is specified, and all loading becomes explicit.
Files under directories named "support" are always loaded first

#### Formatters

Use `--format <TYPE[:PATH]>` to specify the format of the output.
If PATH is not supplied, the formatter prints to stdout.
If PATH is supplied, it prints to the given file.
If multiple formats are specified with the same output, only the last is used.

Built-in formatters
* json - prints the feature as JSON
* pretty - prints the feature as is (default)
* progress - prints one character per scenario
* rerun - prints the paths of the failing scenarios ([example](/features/rerun_formatter.feature))
  * suggested use: add the rerun formatter to your default profile and the output file to your `.gitignore`
* summary - prints a summary only, after all scenarios were executed

#### Tags

Use `--tags <EXPRESSION>` to run specific features or scenarios.

* `--tags @dev`: tagged with @dev
* `--tags ~@dev`: NOT tagged with `@dev`
* `--tags @foo,@bar`: tagged with `@foo` OR `bar`
* `--tags @foo --tags @bar`: tagged with `@foo` AND `bar`

#### Transpilers

Step definitions and support files can be written in other languages that transpile to javascript.
To do this use the CLI option `--compiler <file_extension>:<module_name>`.
Running `require("<module_name>")`, should make it possible to require files with the given extension.
As an example, load [CoffeeScript](https://www.npmjs.com/package/coffee-script) support files with `--compiler coffee:coffee-script/register`.

### Custom snippet syntax

Undefined steps snippets are printed in javascript by default.
Custom snippet syntaxes can be used with `--snippet-syntax <FILE>`.
See [here](/features/step_definition_snippets_custom_syntax.feature) for an example.

### Profiles

In order to store and reuse commonly used CLI options, you can add a `cucumber.js` file to your project root directory. The file should export an object where the key is the profile name and the value is a string of CLI options. The profile can be applied with `-p <NAME>` or `--profile <NAME>`. This will prepend the profile's CLI options to the ones provided by the command line. Multiple profiles can be specified at a time. If no profile is specified and a profile named `default` exists, it will be applied.

##### Building a custom snippet syntax

* See the [JavaScript syntax](/lib/cucumber/support_code/step_definition_snippet_builder/javascript_syntax.js) for an example. Please open an issue if you need more information.
* Please add the keywords `cucumber` and `snippets` to your package,
so it can easily be found by searching [npm](https://www.npmjs.com/search?q=cucumber+snippets).

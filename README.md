# Cucumber.js
  [![Build Status](https://travis-ci.org/cucumber/cucumber-js.png?branch=master)](https://travis-ci.org/cucumber/cucumber-js)
  [![Dependencies](https://david-dm.org/cucumber/cucumber-js.png)](https://david-dm.org/cucumber/cucumber-js) [![Code Climate](https://codeclimate.com/github/cucumber/cucumber-js.png)](https://codeclimate.com/github/cucumber/cucumber-js)

[![NPM](https://nodei.co/npm/cucumber.png?stars&downloads)](https://nodei.co/npm/cucumber/)
[![NPM](https://nodei.co/npm-dl/cucumber.png)](https://nodei.co/npm/cucumber/)


*Cucumber*, the [popular Behaviour-Driven Development tool](http://cukes.info), brought to your JavaScript stack.

It runs on both Node.js and *modern* web browsers.

## Prerequesites

* [Node.js](http://nodejs.org) or [io.js](https://iojs.org)
* [NPM](http://npmjs.org)

Cucumber.js is tested on:

* Node.js 0.8, 0.10, 0.11, 0.12 and io.js (see [CI builds](http://travis-ci.org/#!/cucumber/cucumber-js))
* Google Chrome
* Firefox
* Safari
* Opera

## Usage

### Install

Cucumber.js is available as an npm module.

Install globally with:

``` shell
$ npm install -g cucumber
```

OR

You may also define cucumber.js as a development dependency of your application by including it in a package.json file.

``` json
// package.json

{ "devDependencies" : {
    "cucumber": "latest"
  }
}
```

Then install with `npm install --dev`


### Features

Features are written with the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin)

``` gherkin
# features/myFeature.feature

Feature: Example feature
  As a user of cucumber.js
  I want to have documentation on cucumber
  So that I can concentrate on building awesome applications

  Scenario: Reading documentation
    Given I am on the Cucumber.js GitHub repository
    When I go to the README file
    Then I should see "Usage" as the page title
```

### Support Files

Support files let you setup the environment in which steps will be run, and define step definitions. Both JavaScript (`.js`) and CoffeeScript (`.coffee`) source files are supported.

#### World

*World* is a constructor function with utility properties, destined to be used in step definitions:

```javascript
// features/support/world.js
module.exports = function() {
  var zombie = require('zombie');
  this.World = function World(callback) {
    this.browser = new zombie(); // this.browser will be available in step definitions

    this.visit = function(url, callback) {
      this.browser.visit(url, callback);
    };

    callback(); // tell Cucumber we're finished and to use 'this' as the world instance
  };
}
```

It is possible to tell Cucumber to use another object instance than the constructor:

``` javascript
// features/support/world.js

var zombie = require('zombie');
var WorldConstructor = function WorldConstructor(callback) {

  var browser = new zombie();

  var world = {
    browser: browser,                        // this.browser will be available in step definitions
    visit: function(url, callback) {         // this.visit will be available in step definitions
      this.browser.visit(url, callback);
    }
  };

  callback(world); // tell Cucumber we're finished and to use our world object instead of 'this'
};
exports.World = WorldConstructor;
```

#### Step Definitions

Step definitions are the glue between features written in Gherkin and the actual *SUT* (*system under test*). They are written in JavaScript.

All step definitions will run with `this` set to what is known as the *[World](https://github.com/cucumber/cucumber/wiki/A-Whole-New-World)* in Cucumber. It's an object exposing useful methods, helpers and variables to your step definitions. A new instance of `World` is created before each scenario.

Step definitions are contained within one or more wrapper functions.

Those wrappers are run before executing the feature suite. `this` is an object holding important properties like the `Given()`, `When()` and `Then()` functions. Another notable property is `World`; it contains a default `World` constructor that can be either extended or replaced.

Step definitions are run when steps match their name. `this` is an instance of `World`.

``` javascript
// features/step_definitions/myStepDefinitions.js

var myStepDefinitionsWrapper = function () {
  this.World = require("../support/world.js").World; // overwrite default World constructor

  this.Given(/^I am on the Cucumber.js GitHub repository$/, function(callback) {
    // Express the regexp above with the code you wish you had.
    // `this` is set to a new this.World instance.
    // i.e. you may use this.browser to execute the step:

    this.visit('http://github.com/cucumber/cucumber-js', callback);

    // The callback is passed to visit() so that when the job's finished, the next step can
    // be executed by Cucumber.
  });

  this.When(/^I go to the README file$/, function(callback) {
    // Express the regexp above with the code you wish you had. Call callback() at the end
    // of the step, or callback.pending() if the step is not yet implemented:

    callback.pending();
  });

  this.Then(/^I should see "(.*)" as the page title$/, function(title, callback) {
    // matching groups are passed as parameters to the step definition

    var pageTitle = this.browser.text('title');
    if (title === pageTitle) {
      callback();
    } else {
      callback.fail(new Error("Expected to be on page with title " + title));
    }
  });
};

module.exports = myStepDefinitionsWrapper;
```

It is also possible to use simple strings instead of regexps as step definition patterns:

```javascript
this.Then('I should see "$title" as the page title', function(title, callback) {
  // the above string is converted to the following Regexp by Cucumber:
  // /^I should see "([^"]*)" as the page title$/

  var pageTitle = this.browser.text('title');
  if (title === pageTitle) {
    callback();
  } else {
    callback.fail(new Error("Expected to be on page with title " + title));
  }
});
```

`'I have $count "$string"'` would translate to `/^I have (.*) "([^"]*)"$/`.

#### Hooks

Hooks can be used to prepare and clean the environment before and after each scenario is executed.

##### Before hooks

To run something before every scenario, use before hooks:

``` javascript
// features/support/hooks.js (this path is just a suggestion)

var myHooks = function () {
  this.Before(function(callback) {
    // Just like inside step definitions, "this" is set to a World instance.
    // It's actually the same instance the current scenario step definitions
    // will receive.

    // Let's say we have a bunch of "maintenance" methods available on our World
    // instance, we can fire some to prepare the application for the next
    // scenario:

    this.bootFullTextSearchServer();
    this.createSomeUsers();

    // Don't forget to tell Cucumber when you're done:
    callback();
  });
};

module.exports = myHooks;
```

##### After hooks

The *before hook* counterpart is the *after hook*. It's similar in shape but is executed, well, *after* every scenario:

```javascript
// features/support/after_hooks.js

var myAfterHooks = function () {
  this.After(function(callback) {
    // Again, "this" is set to the World instance the scenario just finished
    // playing with.

    // We can then do some cleansing:

    this.emptyDatabase();
    this.shutdownFullTextSearchServer();

    // Release control:
    callback();
  });
};

module.exports = myAfterHooks;
```

##### After features event

The *after features event* is emitted once all features have been executed, just before the process exits. It can be used for tasks such as closing your browser after running automated browser tests with [selenium](https://code.google.com/p/selenium/wiki/WebDriverJs) or [phantomjs](http://phantomjs.org/).

note: There are "Before" and "After" events for each of the following: "Features", "Feature", "Scenario", "Step" as well as the standalone events "Background" and "StepResult". e.g. "BeforeScenario".

```javascript
// features/support/world.js
var webdriver = require("selenium-webdriver");

var World = function World(callback) {
  this.driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
  callback();
}

module.exports = World;

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


##### Around hooks

It's also possible to combine both before and after hooks in one single definition with the help of *around hooks*:

```javascript
// features/support/advanced_hooks.js

myAroundHooks = function() {
  this.Around(function(runScenario) {
    // "this" is - as always - an instance of World promised to the scenario.

    // First do the "before scenario" tasks:

    this.bootFullTextSearchServer();
    this.createSomeUsers();

    // When the "before" duty is finished, tell Cucumber to execute the scenario
    // and pass a function to be called when the scenario is finished:

    runScenario(function(callback) {
      // Now, we can do our "after scenario" stuff:

      this.emptyDatabase();
      this.shutdownFullTextSearchServer();

      // Tell Cucumber we're done:
      callback();
    });
  });
};

module.exports = myAroundHooks;
```

##### Tagged hooks

Hooks can be conditionally elected for execution based on the tags of the scenario.

``` javascript
// features/support/hooks.js (this path is just a suggestion)

var myHooks = function () {
  this.Before("@foo", "@bar,@baz", function(callback) {
    // This hook will be executed before scenarios tagged with @foo and either
    // @bar or @baz.

    // ...

    callback();
  });
};

module.exports = myHooks;
```

##### Context data

You can access the scenario currently being run by adding a parameter
to your function:

``` javascript
this.Before(function (scenario, callback) {
  console.log(scenario.getName(), "(" + scenario.getUri() + ":" + scenario.getLine() + ")");
  callback();
});
```

See
[Cucumber.Ast.Scenario](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/ast/scenario.js)
for more information about the `scenario` object.

### Run cucumber

Cucumber.js includes a binary file to execute the features.

If you installed cucumber.js globally, you may run it with:

``` shell
$ cucumber.js
```

You may specify the features to run:

``` shell
$ cucumber.js features/my_feature.feature
```

And require specific step definitions and support code files with the --require option:

``` shell
$ cucumber.js features/my_feature.feature --require features/step_definitions/my_step_definitions.js
```

If you installed Cucumber locally or with `npm install --dev`, you'll need to specify the path to the binary:

``` shell
$ ./node_modules/.bin/cucumber.js
```

**Note to Windows users:** invoke Cucumber.js with `cucumber-js` instead of `cucumber.js`. The latter is causing the operating system to invoke JScript instead of Node.js, because of the so-called file extension.

### Examples

A few example apps are available for you to browse:

* [Rails app serving features in the browser](https://github.com/jbpros/cucumber-js-example)
* [Express.js app running features in the cli](https://github.com/olivoil/NodeBDD)

## Contribute

See [CONTRIBUTE](https://github.com/cucumber/cucumber-js/blob/master/CONTRIBUTE.md).

## Help & support

* Twitter: [@cucumber_js](https://twitter.com/#!/cucumber_js/)
* IRC: [#cucumber](http://webchat.freenode.net?channels=cucumber&uio=d4) on Freenode
* Google Groups: [cukes](https://groups.google.com/group/cukes)
* [cukes.info](http://cukes.info)

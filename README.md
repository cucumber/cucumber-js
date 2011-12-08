# Cucumber.js [![Build Status](https://secure.travis-ci.org/cucumber/cucumber-js.png)](http://travis-ci.org/cucumber/cucumber-js)

*Cucumber*, the [popular Behaviour-Driven Development tool](http://cukes.info), brought to your JavaScript stack.

It runs on both Node.js and *modern* web browsers.

**Try it now: [http://cucumber.no.de](http://cucumber.no.de)!**

## Development status

Cucumber.js is still a work in progress. Here is its current status.

### Cucumber Technology Compatibility Kit

| Feature                                                                                                                       | Status              |
|:------------------------------------------------------------------------------------------------------------------------------|:--------------------|
| [Core](https://github.com/cucumber/cucumber-tck/blob/master/core.feature) (scenarios, steps, mappings)                        | Done                |
| [Background](https://github.com/cucumber/cucumber-tck/blob/master/background.feature)                                         | Done<sup>1</sup>    |
| [Calling steps from step defs](https://github.com/cucumber/cucumber-tck/blob/master/calling_steps_from_stepdefs.feature)      | To do               |
| [Comments](https://github.com/cucumber/cucumber-tck/blob/master/comments.feature)                                             | Done                |
| [Command-line interface](https://github.com/cucumber/cucumber-tck/blob/master/command_line_interface.feature)                 | Done<sup>1, 2</sup> |
| [Command-line options](https://github.com/cucumber/cucumber-tck/blob/master/command_line_options.feature)                     | To do<sup>2</sup>   |
| [Data tables](https://github.com/cucumber/cucumber-tck/blob/master/data_tables.feature)                                       | Done                |
| [Doc Strings](https://github.com/cucumber/cucumber-tck/blob/master/doc_strings.feature)                                       | Done                |
| [Failing steps](https://github.com/cucumber/cucumber-tck/blob/master/failing_steps.feature)                                   | Done                |
| [Hooks](https://github.com/cucumber/cucumber-tck/blob/master/hooks.feature)                                                   | To do               |
| [I18n](https://github.com/cucumber/cucumber-tck/blob/master/i18n.feature)                                                     | To do               |
| [JSON formatter](https://github.com/cucumber/cucumber-tck/blob/master/json_formatter.feature)                                 | To do               |
| [Pretty formatter](https://github.com/cucumber/cucumber-tck/blob/master/pretty_formatter.feature)                             | To do<sup>2</sup>   |
| [Scenario outlines and examples](https://github.com/cucumber/cucumber-tck/blob/master/scenario_outlines_and_examples.feature) | To do               |
| [Stats collector](https://github.com/cucumber/cucumber-tck/blob/master/stats_collector.feature)                               | To do               |
| [Step argument transforms](https://github.com/cucumber/cucumber-tck/blob/master/step_argument_transforms.feature)             | To do               |
| [Tags](https://github.com/cucumber/cucumber-tck/blob/master/tags.feature)                                                     | To do               |
| [Undefined steps](https://github.com/cucumber/cucumber-tck/blob/master/undefined_steps.feature)                               | Done                |
| [Wire protocol](https://github.com/cucumber/cucumber-tck/blob/master/wire_protocol.feature)                                   | To do               |
| [World](https://github.com/cucumber/cucumber-tck/blob/master/world.feature)                                                   | Done                |

1. Not certified by [Cucumber TCK](https://github.com/cucumber/cucumber-tck) yet.
2. Considered for removal from [Cucumber TCK](https://github.com/cucumber/cucumber-tck).

### Cucumber.js-specific features

| Feature                                                                                                           | Status           |
|:------------------------------------------------------------------------------------------------------------------|:-----------------|
| [Background](https://github.com/cucumber/cucumber-js/blob/master/features/background.feature)                     | Done<sup>1</sup> |
| [CoffeeScript support](https://github.com/cucumber/cucumber-js/blob/master/features/coffeescript_support.feature) | Done             |
| [Command-line interface](https://github.com/cucumber/cucumber-js/blob/master/features/cli.feature)                | Done             |

1. Will be certified by [Cucumber TCK](https://github.com/cucumber/cucumber-tck).

## Prerequesites

* [Node.js](http://nodejs.org)
* [NPM](http://npmjs.org)

Cucumber.js is tested on:

* Node.js 0.4, 0.6 (see [CI builds](http://travis-ci.org/#!/cucumber/cucumber-js)) and supposedly 0.5.
* Google Chrome
* Firefox
* Safari
* Opera

There are plans to have CI builds on browsers too.

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
    Given I am on the cucumber.js github page
    When I go to the README file
    Then I should see "Usage"
```

### Support Files

Support files let you setup the environment in which steps will be run, and define step definitions.

#### World

A World is a constructor function with utility properties, destined to be used in step definitions

``` javascript
// features/support/world.js

require('zombie');
var World = function() {
  this.browser = new zombie.Browser(); // this.browser will be available in step definitions

  this.visit = function(url, callback) {
    this.browser.visit(url, callback);
  };
};
exports.World = World;
```

#### Step Definitions

Step definitions are the glue between features written in Gherkin and the actual *SUT* (*system under test*). They are written in JavaScript.

All step definitions will run with `this` set to what is known as the *[World](https://github.com/cucumber/cucumber/wiki/A-Whole-New-World)* in Cucumber. It's an object exposing useful methods, helpers and variables to your step definitions. A new instance of `World` is created before each scenario.

Step definitions are contained within one or more wrapper functions.

Those wrappers are run before executing the feature suite. `this` is an object holding important properties like the `Given()`, `When()` and `Then()` functions. Another notable property is `World`; it contains a default `World` constructor that can be either extended or replaced.

Step definitions are run when steps match their name. `this` is an instance of `World`.

``` javascript
// features/step_definitions/myStepDefinitions.js

var myStepDefinitionsWrapper = function() {
  this.World = require("../support/world.js").World; // overwrite default World constructor

  this.Given(/REGEXP/, function(next) {
    // express the regexp above with the code you wish you had
    // this is set to a new this.World instance
    // i.e. you may use this.browser to execute the step...

    this.visit('http://github.com/cucumber/cucumber-js', next);
  });

  this.When(/REGEXP/, function(next) {
    // express the regexp above with the code you wish you had
    // Call next() at the end of the step, or next.pending() if the step is not yet implemented.
    next.pending();
  });

  this.Then(/REGEXP/, function(next) {
    next.pending();
  });
};

module.exports = myStepDefinitionsWrapper;
```

### Run cucumber

Cucumber.js includes a binary file to execute the features.

If you installed cucumber.js with `npm install --dev`, you may run cucumber with:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js
```

You may specify the features to run:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js features/myFeature.feature
```

And require specific step definitions with the --require option:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js features/myFeature.feature \
    --require features/step_definitions/myStepDefinitions.js
```



### Examples

A few example apps are available for you to browse:

* [Rails app serving features in the browser](https://github.com/jbpros/cucumber-js-example)
* [Express.js app running features in the cli](https://github.com/olivoil/NodeBDD)
* [Try cucumber.js in the browser](http://cucumber.no.de/)



## Setup for using in Node.js and running tests

Install the required dependencies:

    $ npm link

## Play

    $ node example/server.js

Then go to [localhost:9797](http://localhost:9797/).

## Run tests

### Specs

    $ node_modules/.bin/jasmine-node spec

### Features & documentation

There is a common set of features shared by all cucumber implementations. It's called the *Technology Compatibility Kit* or *TCK*. Find more on the [Cucumber TCK](http://github.com/cucumber/cucumber-tck) repository.

The official way of running them is through Cucumber-ruby and Aruba. Ruby and Bundler are required for this to work.

    $ git submodule update --init
    $ bundle
    $ rm -rf doc; ARUBA_REPORT_DIR=doc cucumber features/cucumber-tck -r features

You can then open the generated documentation:

    $ open doc/features/cucumber-tck/*.html # might open a lot of files ;)

In addition to that, Cucumber.js is able to run the features for itself too:

    $ ./bin/cucumber.js features/cucumber-tck -r features

There are a few other Cucumber.js-dependent features. Execute everything:

    $ ./bin/cucumber.js

### Rake

Alternatively, you can run everything with the help of Rake:

    $ git submodule update --init
    $ bundle
    $ rake

### Debug messages

You can display debug messages by setting the DEBUG_LEVEL environment variable. It goes from `1` to `5`. `5` will diplay everything, `1` will only print out the critical things.

    $ DEBUG_LEVEL=5 ./bin/cucumber.js

It even works with Aruba:

    $ rm -rf doc; DEBUG_LEVEL=5 ARUBA_REPORT_DIR=doc cucumber features/cucumber-tck -r features
    $ open doc/features/cucumber-tck/*.html # you'll see debug messages in Aruba-generated docs

# Cucumber.js [![Build Status](https://secure.travis-ci.org/cucumber/cucumber-js.png)](http://travis-ci.org/cucumber/cucumber-js)

*Cucumber*, the [popular Behaviour-Driven Development tool](http://cukes.info), brought to your JavaScript stack.

It runs on both Node.js and *modern* web browsers.

**Try it now: [http://cucumber.no.de](http://cucumber.no.de)!**

## Development status

Cucumber.js is still a work in progress. Here is its current status.

### Cucumber Technology Compatibility Kit

<table>
<thead>
  <tr><th>Feature</th><th>Status</th></tr>
</thead>
<tbody>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/core.feature">Core</a> (scenarios, steps, mappings)</td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/background.feature">Background</a></td><td>Done<sup>1</sup></td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/calling_steps_from_stepdefs.feature">Calling steps from step defs</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/comments.feature">Comments</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/command_line_interface.feature">Command-line interface</a></td><td>Done<sup>1, 2</sup></td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/command_line_options.feature">Command-line options</a></td><td>To do<sup>2</sup></td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/data_tables.feature">Data tables</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/doc_strings.feature">Doc Strings</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/failing_steps.feature">Failing steps</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/hooks.feature">Hooks</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/i18n.feature">I18n</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/json_formatter.feature">JSON formatter</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/pretty_formatter.feature">Pretty formatter</a></td><td>To do<sup>2</sup></td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/scenario_outlines_and_examples.feature">Scenario outlines and examples</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/stats_collector.feature">Stats collector</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/step_argument_transforms.feature">Step argument transforms</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/tags.feature">Tags</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/undefined_steps.feature">Undefined steps</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/wire_protocol.feature">Wire protocol</a></td><td>To do</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-tck/blob/master/world.feature">World</a></td><td>Done</td></tr>
</tbody>
</table>

1. Not certified by [Cucumber TCK](https://github.com/cucumber/cucumber-tck) yet.
2. Considered for removal from [Cucumber TCK](https://github.com/cucumber/cucumber-tck).

### Cucumber.js-specific features

<table>
<thead>
  <tr><th>Feature</th><th>Status</th></tr>
</thead>
<tbody>
  <tr><td><a href="https://github.com/cucumber/cucumber-js/blob/master/features/background.feature">Background</a></td><td>Done<sup>1</sup></td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-js/blob/master/features/coffeescript_support.feature">CoffeeScript support</a></td><td>Done</td></tr>
  <tr><td><a href="https://github.com/cucumber/cucumber-js/blob/master/features/cli.feature">Command-line interface</a></td><td>Done</td></tr>
</tbody>
</table>

1. Will be certified by [Cucumber TCK](https://github.com/cucumber/cucumber-tck).

## Prerequesites

* [Node.js](http://nodejs.org)
* [NPM](http://npmjs.org)

Cucumber.js was tested on:

* Node.js 0.4, 0.5, 0.6
* Google Chrome
* Firefox
* Safari

## Usage

#### Install

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


#### Features

Features are written with the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin)

``` gherkin
// features/myFeature.feature

Feature: Example feature
  As a user of cucumber.js
  I want to have documentation on cucumber
  So that I can concentrate on building awesome applications
  
  Scenario: Reading documentation
    Given I am on the cucumber.js github page
    When I go to the README file
    Then I should see "Usage"
```

#### Support Files

Support files let you setup the environment in which steps will be run, and define step definitions.

##### World

A World is a constructor function with utility properties, destined to be used in step definitions

``` javascript
// features/support/world.js

require('zombie');
var World = module.exports = function(){
  this.browser = new zombie.Browser(); // this.browser will be available in step definitions
  
  this.visit = function(url){
    this.browser.visit(url, callback(err, browser, status){
      callback(err, browser, status);
    });
  };
};
```

##### Step Definitions

Step definitions are written in javascript.
Each step definition has a World property that can be set to a constructor function.
Each individual step will be executed in the context of an instance of the World function. 
(i.e. `this` inside a step will refer to a newly created instance of the World property, making sure state stays consistent between each scenario)


``` javascript
// features/step_definitions/myStepDefinitions.js

var myStepDefinitions = function(){
  this.World = require(" <path to the world file> ");
  
  this.Given( <REGEXP>, function(next){
    // express the regexp above with the code you wish you had
    // this is set to a new this.World instance
    // i.e. you may use this.browser to execute the step...
    
    this.visit('http://github.com/cucumber/cucumber-js', next);
  });
  
  this.When( <REGEXP>, function(next) {
    // express the regexp above with the code you wish you had
    // Call next() at the end of the step, or next.pending() if the step is not yet implemented.
    next.pending();
  });
  
  this.Then( <REGEXP>, function(next) {
    // express the regexp above with the code you wish you had
    next.pending();
  });
};
```

#### Run cucumber

Cucumber.js includes a binary file to execute the features.

If you installed cucumber.js with `npm install --dev`, you may run cucumber with:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js
```

You may specify the features to run with the first argument:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js features/myFeature.feature
```

And require specific step definitions with the --require option:

``` shell
  @NODE_ENV=test ./node_modules/.bin/cucumber.js features/myFeature.feature \
    --require features/step_definitions/myStepDefinitions.js
```



#### Examples

A few example apps are available for you to browse:

+ [Rails app serving features in the browser](https://github.com/jbpros/cucumber-js-example)
+ [Express.js app running features in the cli](https://github.com/olivoil/NodeBDD)
+ [Try cucumber.js in the browser](http://cucumber.no.de/)



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

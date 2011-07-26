# Cucumber.js

Cucumber brought (natively) to your JavaScript stack.

It can run basic fatures inside both Node.js and web browsers.

It still needs a lot of work. Only a few feature elements are supported at the moment.

## Prerequesites

* Node.js 0.4.8 (tested on 0.4.7 too)
* npm 1.0.6

### Works on

* Node.js 0.4.7, 0.4.8, 0.5.0-pre
* Google Chrome 13.0.772.0 (dev)
* Firefox 4.0.1
* Safari 5.0.5

And probably lots of other browsers.

## Play with it!

    $ node example/server.js

Then go to [localhost:9797](http://localhost:9797/).

## Setup for using in Node.js and running tests

The only dependency of cucumber.js is Gherkin:

    $ npm link

## Run tests

### Specs

    $ cd spec
    $ ../node_modules/.bin/jasmine-node .

### Features

Features run through cucumber.js have to be executed one at a time for the moment. We are working on it :)

#### Cucumber-features

There is a common set of features shared between all cucumber implementations. Find more on the [Github repository](http://github.com/cucumber/cucumber-features).

Ruby and Bundler are required for this to work.

    $ git submodule update --init
    $ bundle
    $ rm -rf doc; ARUBA_REPORT_DIR=doc cucumber features/cucumber-features/core.feature -r features
    $ open doc/features/cucumber-features/*.html # might open a lot of files ;)

#### Run Cucumber.js to test itself

This is still a work in progress; some step definition mappings are missing to run the core.feature with Cucumber.js.

You can run the following script which will execute cucumber.js recursively against all known passing features and "core.feature":

    $ ./run_all_features.js

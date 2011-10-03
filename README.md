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

## Setup for using in Node.js and running tests

Install the required dependencies:

    $ npm link

## Play with it!

    $ node example/server.js

Then go to [localhost:9797](http://localhost:9797/).

## Run tests

### Specs

    $ node_modules/.bin/jasmine-node spec

### Features & documentation

There is a common set of features shared between all cucumber implementations. Find more on the [cucumber-features](http://github.com/cucumber/cucumber-features) repository.

The official way of running them is through Cucumber-ruby and Aruba. Ruby and Bundler are required for this to work.

    $ git submodule update --init
    $ bundle
    $ rm -rf doc; ARUBA_REPORT_DIR=doc cucumber features/cucumber-features -r features

You can then open the generated documentation:

    $ open doc/features/cucumber-features/*.html # might open a lot of files ;)

In addition to that, Cucumber.js is able to run the features for itself too:

    $ ./bin/cucumber.js features/cucumber-features -r features

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

    $ rm -rf doc; DEBUG_LEVEL=5 ARUBA_REPORT_DIR=doc cucumber features/cucumber-features -r features
    $ open doc/features/cucumber-features/*.html # you'll see debug messages in Aruba-generated docs

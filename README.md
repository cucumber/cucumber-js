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

    $ open example/index.html

## Setup for using in Node.js and running tests

The only dependency of cucumber.js is Gherkin:

    $ npm link
    
## Run tests

Specs:

    $ cd spec
    $ ../node_modules/.bin/jasmine-node .
    
Features (yes, cucumber.js is eating itself):

    $ git submodule update --init
    $ ./cucumber.js features/global/basic_feature_execution.feature
    $ ./cucumber.js features/asynchronous_step_definitions-issue_01.feature

The features have to be run one at a time for the moment. Sorry for that, we're working on it :)

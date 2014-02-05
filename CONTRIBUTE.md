## Thank you!

Before anything else, thank you. Thank you for taking some of your precious time helping this project move forward.

This guide will help you get started with Cucumber.js's development environment. You'll also find the set of rules you're expected to follow in order to submit improvements and fixes to Cucumber.js.

## Get started

After forking and cloning the repository, install the required dependencies:

    $ cd <path/to/cucumber-js>
    $ npm link

## Play

    $ node example/server.js

Then go to [localhost:9797](http://localhost:9797/) to see the little web demo.

## Tests

There are two set of tests resulting from the BDD approach we've been applying to Cucumber.js from the beginning.

* full-stack tests (outside): surprisingly those are Gherkin scenarios;
* unit tests (inside): jasmine specs.

### Specs

Run the specs:

    $ node_modules/.bin/jasmine-node spec

### Features & documentation

There is a common set of features shared by all cucumber implementations. It's called the *Technology Compatibility Kit* or *TCK*. Find more on the [Cucumber TCK](http://github.com/cucumber/cucumber-tck) repository.

The official way of running them is through Cucumber-ruby and Aruba. Ruby and Bundler are required for this to work.

    $ git submodule update --init
    $ bundle
    $ rm -rf doc; ARUBA_REPORT_DIR=doc cucumber features/cucumber-tck -r features

*Note*: you need the *bcat* and *rdiscount* gems in order to use the `ARUBA_REPORT_DIR` environment variable. Install it with `gem install bcat rdiscount`.

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

You can display debug messages by setting the DEBUG_LEVEL environment variable. It goes from `1` to `5`. `5` will display everything, `1` will only print out the critical things.

    $ DEBUG_LEVEL=5 ./bin/cucumber.js

It even works with Aruba:

    $ rm -rf doc; DEBUG_LEVEL=5 ARUBA_REPORT_DIR=doc cucumber features/cucumber-tck -r features
    $ open doc/features/cucumber-tck/*.html # you'll see debug messages in Aruba-generated docs


## Coding guidelines

If you plan on submitting code, read this carefully. Please note it is not yet complete.

We stick to the [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

In addition to those syntactic rules, we apply the following principles:

### Write expressive method and function names

Use expressive names. Express arguments as part of the method/function name. Someone calling it should be able to infer the expected arguments only from the name. They shouldn't have to check the method/function definition.

``` javascript
adorn(/* ... */) // BAD: it does not tell anything about its
                 // parameters, you'll need to read the method
                 // definition to know the arguments.

addStyleToText(/* ... */) // you can fairly guess this function
                          // accepts "style" and "text" arguments:
```

** WORK IN PROGRESS **

## Release checklist

This a reminder of the steps maintainers have to follow to release a new version of Cucumber.js.

* Update development status in `README.md`, if relevant
* Update `History.md`
* Bump version in `lib/cucumber.js`
* Bump version in `package.json`
* Bump version in `bower.json`
* Compile the bundle with `node scripts/compile-release.js`
* Add new contributors to `package.json`, if any
* Commit those changes as "*Release 0.1.2*" (where *0.1.2* is the actual version, of course)
* Tag commit as "v0.1.2" with short description of main changes
* Push to main repo on GitHub
* Wait for build to go green
* Publish to NPM

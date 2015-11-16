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

    $ npm i && npm test

### Debug messages

You can display debug messages by setting the DEBUG_LEVEL environment variable. It goes from `1` to `5`. `5` will display everything, `1` will only print out the critical things.

    $ DEBUG_LEVEL=5 ./bin/cucumber.js


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

* Update `CHANGELOG.md`. `git log --format=format:"* %s (%an)" --reverse <last-version-tag>..HEAD` might be handy.
* Bump version in `package.json`
* Compile the bundle with `npm run build-release`
* Add new contributors to `package.json`, if any
* Commit those changes as "*Release 0.1.2*" (where *0.1.2* is the actual version, of course)
* Tag commit as "v0.1.2" with a description of the major changes introduced. API changes must be documented. In particular, backward-incompatible changes must be well explained, with examples when possible.
* Push to main repo on GitHub
* Wait for build to go green
* Publish to NPM

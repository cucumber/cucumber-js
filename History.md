# Cucumber.js changelog

## [v0.2](https://github.com/cucumber/cucumber-js/compare/v0.1.5...master)

### [master (unreleased)](https://github.com/cucumber/cucumber-js/compare/v0.2.3...master)

#### New features

* Add --version to CLI (Julien Biezemans)
* Add --help to CLI (Julien Biezemans)

#### Internals and tests

* Update README (Julien Biezemans)
* Add development status to README (Julien Biezemans)
* Add link to demo at cucumber.no.de (Julien Biezemans)
* Add link to example app to README (Julien Biezemans)
* Add usage documentation to README (close #23) (Olivier Melcher)
* Add examples to run features with the CLI (Olivier Melcher)
* Fix header levels and whitespaces in README (Julien Biezemans)
* Add Opera to supported browsers in README (Julien Biezemans)
* Fix World constructor in README (Julien Biezemans)
* Simplify World#visit in README (Julien Biezemans)
* Rewrite step definition and wrapper documentation (Julien Biezemans)
* Remove useless words (Julien Biezemans)
* Use more consistent Markdown in README (Julien Biezemans)
* Fix Gherkin comment in README (Julien Biezemans)
* Add credits (Julien Biezemans)

### [v0.2.3](https://github.com/cucumber/cucumber-js/compare/v0.2.2...v0.2.3)

#### New features

* Add support for Node 0.6 (Julien Biezemans)

#### Fixes

* Prevent the same step definition snippet from being suggested twice (Julien Biezemans)

#### Internals and tests

* Don't make NPM ignore `example/` anymore (Julien Biezemans)
* Bump cucumber-features (Julien Biezemans)
* Use non-deprecated "url" key instead of "web" in NPM manifest (Julien Biezemans)
* Add JS step definitions related to data table scenarios (Julien Biezemans)
* Move from cucumber-features to cucumber-tck (Julien Biezemans)
* Bump Gherkin (Julien Biezemans)
* Bump jasmine-node (Julien Biezemans)
* Bump connect (Julien Biezemans)
* Fix Travis build (Julien Biezemans)
* Bump browserify (Julien Biezemans)
* Bump nopt (Julien Biezemans)
* Bump underscore (Julien Biezemans)
* Bump underscore.string (Julien Biezemans)
* Bump rimraf (Julien Biezemans)
* Bump mkdirp (Julien Biezemans)
* Bump Aruba (Julien Biezemans)



### [v0.2.2](https://github.com/cucumber/cucumber-js/compare/v0.2.1...v0.2.2)

#### New features

* Suggest step definition snippets for undefined steps (#33 Julien Biezemans)

#### Internals and tests

* Add contributors to NPM package manifest (Julien Biezemans)
* Clean up JS step definitions (Julien Biezemans)
* Bump cucumber-features and reflect step changes (Julien Biezemans)
* Set up [continuous integration on Travis CI](http://travis-ci.org/#!/cucumber/cucumber-js) (Julien Biezemans)
* Add Travis's build status icon to README (Julien Biezemans)



### [v0.2.1](https://github.com/cucumber/cucumber-js/compare/v0.2.0...v0.2.1)

#### New features

* Allow custom World constructors (Julien Biezemans)
* Add support for data tables (with conversion to hashes) (#12 Julien Biezemans)

#### Changed features

* Demonstrate World object usages in web example (Julien Biezemans)



### [v0.2.0](https://github.com/cucumber/cucumber-js/compare/v0.1.5...v0.2.0)

#### New features

* Setup application to run on [Travis CI](http://travis-ci.org/#!/jbpros/cucumber-js) (Julien Biezemans)
* Add CoffeeScript support for step definition files (Paul Jensen)
* Add "World" (#26 Julien Biezemans)

#### Changed features

* Add link to the Github repository on web example (Julien Biezemans)
* Allow specifying the port the web example server should listen on (Julien Biezemans)
* Update web example to use cucumber-html formatter (Julien Biezemans)

#### Fixes

* Fix load paths in spec helper (Julien Biezemans)
* Prevent 'crypto' module from being included by browserify in web example (Julien Biezemans)
* Fix HTML indentation (Julien Biezemans)
* Prevent CLI support code loader from calling module main exports which are not functions (Julien Biezemans)
* Remove use of username for submodule (Kushal Pisavadia)

#### Internals and tests

* Bump jasmine-node
* Update README (Julien Biezemans)
* Bump Gherkin twice (Julien Biezemans)
* Bump cucumber-features twice (Julien Biezemans)
* Add missing getters on several AST feature elements (mostly getLine()) (Julien Biezemans)
* Ignore example/ on NPM (Julien Biezemans)
* Add Procfile (used by Heroku when deploying to cucumber.heroku.com) (Julien Biezemans)
* Bump Aruba (Julien Biezemans)
* Add guard-jasmine-node (Julien Biezemans)
* Improve Guardfile regular expressions (Julien Biezemans)
* Bump cucumber-html and remove DOM templates from web example HTML file (Julien Biezemans)
* Fix PathExpander internal name (Julien Biezemans)
* Remove unneeded requires from FeaturePathExpander (Julien Biezemans)
* Bump browserify (Julien Biezemans)
* Remove "glob" from dependencies (Julien Biezemans)
* Refactor SupportCodePathExpander spec (Julien Biezemans)
* Add feature for CoffeeScript support (#29 Julien Biezemans)



## [v0.1](https://github.com/cucumber/cucumber-js/compare/v0.0.1...v0.1.5)

### [v0.1.5](https://github.com/cucumber/cucumber-js/compare/v0.1.4...v0.1.5)

#### New features

* Add support for background (#9 Julien Biezemans)

#### Internals and tests

* Bump cucumber-features (twice) (Julien Biezemans)
* Bump gherkin and reflect changes in its API (add DocString content type) (Julien Biezemans)



### [v0.1.4](https://github.com/cucumber/cucumber-js/compare/v0.1.3...v0.1.4)

#### Changed features

* Stop polluting the global namespace with Given(), When() and Then() (#2 Julien Biezemans)
* Step definitions can be created with the support code helper passed as 'this':
  this.Given(), this.When(), this.Then() and this.defineStep() (#2 Julien Biezemans)

#### Internals and tests

* Fix typo "occured" -> "occurred" (Fernando Acorreia)
* Improve variable names in CLI support code loader (Julien Biezemans)



### [v0.1.3](https://github.com/cucumber/cucumber-js/compare/v0.1.2...v0.1.3)

#### New features

* Allow several features to run at once (#14 Julien Biezemans)
* Add support for --require (Julien Biezemans)

#### Internals and tests

* Improve features and support code API (Julien Biezemans)
* Add "Cli" and "Volatile" configurations (Julien Biezemans)
* Internal refactoring and cleanup (Julien Biezemans)
* Cucumber.js can now fully test itself (Julien Biezemans)
* Remove run_all_features script in favor of bin/cucumber.js (Julien Biezemans)



### [v0.1.2](https://github.com/cucumber/cucumber-js/compare/v0.1.1...v0.1.2)

#### New features

* Add failure reporting to the progress formatter (#20 Julien Biezemans)



### [v0.1.1](https://github.com/cucumber/cucumber-js/compare/v0.1.0...v0.1.1)

#### New features

* Publish Cucumber.js to NPM as [`cucumber`](http://search.npmjs.org/#/cucumber) (Julien Biezemans)

#### Changed features

* Throw a clearer exception on missing feature argument (CLI) (Julien Biezemans)

#### Internals and tests

* Unify and clean up js-specific features and step definitions (#21 Julien Biezemans)



### [v0.1.0](https://github.com/cucumber/cucumber-js/compare/v0.0.1...v0.1.0)

#### New features

* Add cucumber.js executable (Julien Biezemans)
* Handle step failures (#6 Julien Biezemans)
* Add the progress formatter (#16 Julien Biezemans)
* Add support for pending steps (#18 Julien Biezemans)
* Add support for undefined steps (#19 Julien Biezemans)

#### Changed features

* Update web example to use the new progress formatter (Julien Biezemans)

#### Fixes

* Fix asynchronous step definition callbacks (#1 Julien Biezemans)
* Fix stepResult.isSuccessful call in ProgressFormatter (Julien Biezemans)
* Load Gherkin properly in browsers (Julien Biezemans)
* Remove calls to console.log in web example (Julien Biezemans)

#### Internals and tests

* Pass against core.feature in its new form, both with the Cucumber-ruby/Aruba pair and cucumber-js itself (Julien Biezemans)
* Refactor cucumber-features JS mappings (Julien Biezemans)
* Refactor js-specific features (Julien Biezemans)
* Rename PyString to DocString (#15 Julien Biezemans)
* Update Gherkin to 2.4.0 (Julien Biezemans)
* Modularize the project and use browserify.js to serve a single JS file to browsers. (#3 Julien Biezemans)
* Rename Cucumber.Types to Cucumber.Type (Julien Biezemans)
* Use progress formatter in cucumber-features (#17 Julien Biezemans)



## [v0.0](https://github.com/cucumber/cucumber-js/tree/v0.0.1)

### [v0.0.1](https://github.com/cucumber/cucumber-js/tree/v0.0.1)

* Emerge Cucumber.js with bare support for features, scenarios and steps. It does not handle several Gherkin elements nor failures yet. (Julien Biezemans)

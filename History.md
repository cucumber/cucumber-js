# Cucumber.js changelog

## [v0.2](https://github.com/cucumber/cucumber-js/compare/v0.1.5...master)

### [master (unreleased)](https://github.com/cucumber/cucumber-js/compare/v0.2.13...master)

**TBD**


### [v0.2.13](https://github.com/cucumber/cucumber-js/compare/v0.2.12...v0.2.13)


#### New features

* Add support for string-based step definition patterns (closes #48) (Ted de Koning, Julien Biezemans)

#### Documentation, internals and tests

* Pass step instance to step definition invocation (#57) (Julien Biezemans)
* Refactor step result specs (Julien Biezemans)
* Store step on step results (#57) (Julien Biezemans)
* Increase Aruba timeout delay for slow Travis (Julien Biezemans)
* Decouple pattern from regexp in step definition (#48) (Julien Biezemans)



### [v0.2.12](https://github.com/cucumber/cucumber-js/compare/v0.2.11...v0.2.12)

#### Changed features

* Allow World constructor to set explicit World object (close #50) (Julien Biezemans)

#### Documentation, internals and tests

* Add semicolons (Julien Biezemans)
* Add documentation about World to README (Julien Biezemans)



### [v0.2.11](https://github.com/cucumber/cucumber-js/compare/v0.2.10...v0.2.11)

#### Changed features

* Simplify World callbacks (close #49) (Julien Biezemans)

#### Fixes

* Fix callback.fail() when called without any reasons (Julien Biezemans)

#### Documentation, internals and tests

* Add toHaveBeenCalledWithInstanceOfConstructorAsNthParameter() spec helper (Julien Biezemans)
* Simplify default World constructor callback (Julien Biezemans)
* Adapt World constructors (Julien Biezemans)



### [v0.2.10](https://github.com/cucumber/cucumber-js/compare/v0.2.9...v0.2.10)

#### Fixes

* Fix path handling on Windows platforms (close #47) (Julien Biezemans)

#### Documentation, internals and tests

* Add tagged hooks example to README (Julien Biezemans)
* Fix browserify setup for example page load (Julien Biezemans)
* Rename bundle to 'cucumber.js' in web example (Julien Biezemans)
* Remove obsolete browserify directive (Julien Biezemans)
* Improve platform detection (Julien Biezemans)



### [v0.2.9](https://github.com/cucumber/cucumber-js/compare/v0.2.8...v0.2.9)

#### New features

* Add support for tagged hooks (close #32) (Julien Biezemans)

#### Changed features

* Allow for whitespaces in tag groups (Julien Biezemans)

#### Documentation, internals and tests

* Add Cucumber.Type.String and String#trim() (Julien Biezemans)
* Remove unnecessary this. from stepdefs (Julien Biezemans)
* Simplify tag-related stepdefs (Julien Biezemans)
* Simplify tag selection syntax in volatile configuration (Julien Biezemans)
* Mark hooks "done" in README dev status (Julien Biezemans)



### [v0.2.8](https://github.com/cucumber/cucumber-js/compare/v0.2.7...v0.2.8)

#### New features

* Add around hooks (#32) (Julien Biezemans)

#### Changed features

* Treat undefined and skipped step as any other step (Julien Biezemans)

#### Documentation, internals and tests

* Remove unused parameter in parser spec (Julien Biezemans)
* Add JS stepdef for async failing steps scenario (Julien Biezemans)
* Assign zombie in README example (close #44) (Julien Biezemans)
* Remove trailing spaces (Julien Biezemans)
* Get rid of obsolete PendingStepException (Julien Biezemans)
* Refactor SupportCode.Library spec (Julien Biezemans)
* Add around hooks documentation (#32) (Julien Biezemans)



### [v0.2.7](https://github.com/cucumber/cucumber-js/compare/v0.2.6...v0.2.7)

#### New features

* Allow for asynchronous pending steps (Julien Biezemans)
* Allow for asynchronous step failures (Julien Biezemans)

#### Fixes

* Fix matching groups in step definition snippets (close #42) (Julien Biezemans)
* Remove obsolete dependency from snippet builder spec (Julien Biezemans)

#### Documentation, internals and tests

* Add steps to release process in README (Julien Biezemans)
* Update development status table in README (Julien Biezemans)
* Import implementation-specific scenarios from cucumber-tck/undefined_steps (Julien Biezemans)
* Switch from throwing exceptions to callback.fail() in web example (Julien Biezemans)
* Add callback.fail() example to README (Julien Biezemans)

### [v0.2.6](https://github.com/cucumber/cucumber-js/compare/v0.2.5...v0.2.6)

#### New features

* Add tags support (#7) (Julien Biezemans)
* Add support for tags on features (close #7) (Julien Biezemans)

#### Changed features

* Handle missing instance in World constructor callback (close #40) (Julien Biezemans)

#### Documentation, internals and tests

* Update development status in README (Julien Biezemans)
* Typo in README (Julien Biezemans)
* Refactor parser and add AST assembler (required by #7) (Julien Biezemans)
* Indent properly (Julien Biezemans)
* Refactor AST assembler to be stateful (needed by #7) (Julien Biezemans)
* Update master diff in History (Julien Biezemans)
* Add --tags documentation to --help (CLI) (Julien Biezemans)



### [v0.2.5](https://github.com/cucumber/cucumber-js/compare/v0.2.4...v0.2.5)

#### New features

* Add Before/After hooks (#32, close #31) (Tristan Dunn)

#### Changed features

* Interpret "*" step keyword as a repeat keyword (Julien Biezemans)

#### Documentation, internals and tests

* Add NPM publishing to README release checklist (Julien Biezemans)
* Add "Help & Support" to README (Julien Biezemans)
* Words in README (Julien Biezemans)
* Document before and after hooks (Julien Biezemans)



### [v0.2.4](https://github.com/cucumber/cucumber-js/compare/v0.2.3...v0.2.4)

#### New features

* Add --version to CLI (Julien Biezemans)
* Add --help to CLI (Julien Biezemans)

#### Changed features

* Add styles for reported errors on web example (Julien Biezemans)
* Make and expect World constructors to be asynchronous (close #39) (Julien Biezemans)

#### Documentation, internals and tests

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
* Add Aruba setup details to README (Julien Biezemans)
* Fix World constructor on web example according to the recent API changes (Julien Biezemans)
* Tell Travis CI to post build results to #cucumber (Julien Biezemans)
* Add release checklist to README (Julien Biezemans)



### [v0.2.3](https://github.com/cucumber/cucumber-js/compare/v0.2.2...v0.2.3)

#### New features

* Add support for Node 0.6 (Julien Biezemans)

#### Fixes

* Prevent the same step definition snippet from being suggested twice (Julien Biezemans)

#### Documentation, internals and tests

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

#### Documentation, internals and tests

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

#### Documentation, internals and tests

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

#### Documentation, internals and tests

* Bump cucumber-features (twice) (Julien Biezemans)
* Bump gherkin and reflect changes in its API (add DocString content type) (Julien Biezemans)



### [v0.1.4](https://github.com/cucumber/cucumber-js/compare/v0.1.3...v0.1.4)

#### Changed features

* Stop polluting the global namespace with Given(), When() and Then() (#2 Julien Biezemans)
* Step definitions can be created with the support code helper passed as 'this':
  this.Given(), this.When(), this.Then() and this.defineStep() (#2 Julien Biezemans)

#### Documentation, internals and tests

* Fix typo "occured" -> "occurred" (Fernando Acorreia)
* Improve variable names in CLI support code loader (Julien Biezemans)



### [v0.1.3](https://github.com/cucumber/cucumber-js/compare/v0.1.2...v0.1.3)

#### New features

* Allow several features to run at once (#14 Julien Biezemans)
* Add support for --require (Julien Biezemans)

#### Documentation, internals and tests

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

#### Documentation, internals and tests

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

#### Documentation, internals and tests

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

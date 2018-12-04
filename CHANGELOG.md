Please see [CONTRIBUTING.md](https://github.com/cucumber/cucumber/blob/master/CONTRIBUTING.md) on how to contribute to Cucumber.

### [Unreleased](https://github.com/cucumber/cucumber-js/compare/v5.0.3...master) (In Git)

### [5.0.3](https://github.com/cucumber/cucumber-js/compare/v5.0.2...5.0.3) (2018-12-03)

#### Speed Improvements

* Only create Cucumber Expressions once

### [5.0.2](https://github.com/cucumber/cucumber-js/compare/v5.0.1...5.0.2) (2018-10-06)

#### Bug Fixes

* Update default of formatters' colors enabled to be true only if the stream is a TTY
* Allow writing to stdout when running in parallel
* Skip other before hooks if one returns skipped

### [5.0.1](https://github.com/cucumber/cucumber-js/compare/v5.0.0...v5.0.1) (2018-04-09)

#### Bug Fixes

* Update dependencies to avoid licensing problems

### [5.0.0](https://github.com/cucumber/cucumber-js/compare/v4.2.1...v5.0.0) (2018-04-09)

#### BREAKING CHANGES

* Drop support for Node.js 4

#### Bug Fixes

* Update dependencies to avoid licensing problems
* Provide better error message when trying to attach data after the scenario has finished. This is possible if not waiting for the attach to finish.

#### New features

* Add support for Node.js 10

### [4.2.1](https://github.com/cucumber/cucumber-js/compare/v4.2.0...v4.2.1) (2018-04-09)

#### Bug Fixes

* improve the error message for gherkin parse errors

### [4.2.0](https://github.com/cucumber/cucumber-js/compare/v4.1.0...v4.2.0) (2018-04-03)

* add cli option `--order <TYPE[:SEED]>` to run scenarios in the specified order. Type should be `defined` or `random`

### [4.1.0](https://github.com/cucumber/cucumber-js/compare/v4.0.0...v4.1.0) (2018-03-27)

#### New Features

* update step timeout error message for each interface ([#1028](https://github.com/cucumber/cucumber-js/pull/1028), Bruce Lindsay)
* default to synchronous snippets
* print text step attachments ([#1041](https://github.com/cucumber/cucumber-js/pull/1041), DevSide)

#### Bug Fixes

* cucumber-expressions: Upgrade from 5.0.7 to [5.0.13](https://github.com/cucumber/cucumber/blob/master/cucumber-expressions/CHANGELOG.md#5013---2018-01-21)
* fix error serialization in parallel mode

### [4.0.0](https://github.com/cucumber/cucumber-js/compare/v3.2.1...v4.0.0) (2018-01-24)

#### BREAKING CHANGES

* cucumber now waits for the event loop to drain before exiting. To exit immediately when the tests finish running use `--exit`. Use of this flag is discouraged. See [here](/docs/cli.md#exiting) for more information
* remove `--compiler` option. See [here](/docs/cli.md#transpilers) for the new way to use transpilers
* remove binaries `cucumber.js` and `cucumberjs`. Use `cucumber-js`

#### New Features

* can now use glob patterns for selecting what features to run
* update `--require` to support glob patterns
* add `--require-module <NODE_MODULE>` to require node modules before support code is loaded
* add snippet interface "async-await"
* add `--parallel <NUMBER_OF_SLAVES>` option to run tests in parallel. Note this is an experimental feature. See [here](/docs/cli.md#parallel-experimental) for more information

#### Bug Fixes

* revert json formatter duration to nanoseconds

#### Deprecations

* `defineSupportCode` is deprecated. Require/import the individual methods instead
  ```js
  var {defineSupportCode} = require('cucumber');

  defineSupportCode(function({Given}) {
    Given(/^a step$/, function() {});
  });

  // Should be updated to

  var {Given} = require('cucumber');

  Given(/^a step$/, function() {});
  ```

### [3.2.1](https://github.com/cucumber/cucumber-js/compare/v3.2.0...v3.2.1) (2018-01-03)

#### Bug Fixes
* revert json formatter mime type ([#995](https://github.com/cucumber/cucumber-js/pull/995)

### [3.2.0](https://github.com/cucumber/cucumber-js/compare/v3.1.0...v3.2.0) (2017-12-08)

#### New Features
* add exception to `test-case-finished` event ([#952](https://github.com/cucumber/cucumber-js/pull/952) Giuseppe DiBella)
* compiler option - allow `:` in module name to support specifying an absolute path on Windows ([#958](https://github.com/cucumber/cucumber-js/pull/958) Darrin Holst)
* json formatter: format step result exception ([#973](https://github.com/cucumber/cucumber-js/pull/973) Valerio Innocenti Sedili)

#### Bug Fixes
* cucumber-expressions: Upgrade from 5.0.3 to [5.0.6](https://github.com/cucumber/cucumber/blob/master/cucumber-expressions/CHANGELOG.md#506---2017-11-28)
* tag-expressions: Upgrade from 1.0.1 to [1.1.1](https://github.com/cucumber/cucumber/blob/master/tag-expressions/CHANGELOG.md#111---2017-12-01)

### [3.1.0](https://github.com/cucumber/cucumber-js/compare/v3.0.6...v3.1.0) (2017-10-25)

#### New Features
* add `--language` cli option to provide the default language for feature files

#### Bug Fixes
* pickle filter: support relative paths ([#962](https://github.com/cucumber/cucumber-js/pull/962) Marco Muller)

### [3.0.6](https://github.com/cucumber/cucumber-js/compare/v3.0.5...v3.0.6) (2017-10-18)

* cli: fix `--format` option parsing on Windows ([#954](https://github.com/cucumber/cucumber-js/pull/954) Darrin Holst)

### [3.0.5](https://github.com/cucumber/cucumber-js/compare/v3.0.4...v3.0.5) (2017-10-14)

#### New Features

* `defineParameterType`: The `transformer` function's `this` object is now the current World (as long as it's not an arrow function). ([#948](https://github.com/cucumber/cucumber-js/pull/948) Aslak Hellesøy)
* `Before` / `After`: The first argument now includes a `pickle` property which can
be used to get the name / tags of the running scenario. ([#947](https://github.com/cucumber/cucumber-js/pull/947) Giuseppe DiBella)

### [3.0.4](https://github.com/cucumber/cucumber-js/compare/v3.0.3...v3.0.4) (2017-10-04)

#### New Features

* cli: make `--tags` option repeatable (joined with `and`) ([#940](https://github.com/cucumber/cucumber-js/issues/940), Ilya Kozhevnikov)
* rerun formatter: make separator configurable. See docs [here](https://github.com/cucumber/cucumber-js/blob/fb9e8fc2e68d4395b9b0a124d18e036d00a8c69f/docs/cli.md) ([#930](https://github.com/cucumber/cucumber-js/issues/930), Máté Karácsony)

### [3.0.3](https://github.com/cucumber/cucumber-js/compare/v3.0.2...v3.0.3) (2017-09-23)

#### New Features

* support to imperatively skip steps. See documentation [here](/docs/support_files/step_definitions.md#skipped-steps) ([#912](https://github.com/cucumber/cucumber-js/issues/912), jshifflet)

### [3.0.2](https://github.com/cucumber/cucumber-js/compare/v3.0.1...v3.0.2) (2017-09-13)

#### New Features

* `defineParameterType`: new options `useForSnippets` and `preferForRegexpMatch`. Please see documentation for usage.

#### Bug Fixes

* fix `usage` and `usage-json` formatters when there are undefined steps

#### Deprecations

* `defineParameterType`: `typeName` option is deprecated in favor of `name`

### [3.0.1](https://github.com/cucumber/cucumber-js/compare/v3.0.0...v3.0.1) (2017-08-28)

#### Bug Fixes

* JSON formatter: add type to scenario ([#893](https://github.com/cucumber/cucumber-js/issues/893), szymonprz)
* BeforeAll/AfterAll hooks: fix timeout support ([#899](https://github.com/cucumber/cucumber-js/issues/899))
* format output paths: allow absolute paths ([#906](https://github.com/cucumber/cucumber-js/issues/906), Darrin Holst)
* Before/After: fix undefined hook parameter ([#919](https://github.com/cucumber/cucumber-js/issues/919))

#### Documentation

* update nodejs example
([#898](https://github.com/cucumber/cucumber-js/issues/898), João Guilherme Farias Duda)
* fix typo and make punctuation consistent
([#909](https://github.com/cucumber/cucumber-js/issues/909), Dmitry Shirokov)
* normalize CHANGELOG
([#915](https://github.com/cucumber/cucumber-js/issues/915), Jayson Smith)

### [3.0.0](https://github.com/cucumber/cucumber-js/compare/v2.3.1...v3.0.0) (2017-08-08)

#### BREAKING CHANGES

* `pretty` formatter has been removed. All errors are now reported in a `pretty` format instead. The `progress` formatter is now the default.
* Major changes to [custom formatter](/docs/custom_formatters.md) and [custom snippet syntax](/docs/custom_snippet_syntaxes.md) APIs due to rewrite in support of the event protocol. Please see the updated documentation.
* Remove `registerHandler` and `registerListener`. Use `BeforeAll` / `AfterAll` for setup  code. Use the event protocol formatter if used for reporting. Please open an issue if you have another use case.
* Remove deprecated `addTransform`. Use `defineParameterType` instead.
* `cucumber-expressions`:
  * using an undefined parameter type now results in an error
  * `{stringInDoubleQuotes}` is now `{string}` which works for strings in single or double quotes
* Undefined steps fail the build in non-strict mode. Non-strict mode only allows pending steps now.

#### New Features

* Add `--i18n-languages` and `--i18n-keywords <ISO 639-1>` CLI options
* Add `BeforeAll` / `AfterAll` hooks for suite level setup / teardown
* Add event protocol formatter
* `cucumber-expressions`:
  * Add built in `{word}` parameter type which is equivalent to `[A-Za-z0-9_]+`
  * Allow multiple parameter types to use the same regular expression
* Improve error message when using multiple asynchronous interfaces

#### Bug Fixes

* Fix support code line and uri references when using direct imports

### [2.3.1](https://github.com/cucumber/cucumber-js/compare/v2.3.0...v2.3.1) (2017-06-09)

#### New Features

* pass step specific options to definition function wrapper ([#838](https://github.com/cucumber/cucumber-js/issues/838), Łukasz Gandecki)

### [2.3.0](https://github.com/cucumber/cucumber-js/compare/v2.2.0...v2.3.0) (2017-06-01)

#### New Features

* Add support code aliases for every method in the [support code API](./docs/support_files/api_reference.md). The following are now equivalent:
  ```javascript
  // Using defineSupportCode
  var {defineSupportCode} = require('cucumber');

  defineSupportCode(function({Given}) {
    Given(/^a step$/, function() {});
  });

  // Using aliases
  var {Given} = require('cucumber');

  Given(/^a step$/, function() {});
  ```
  (Nico Jansen and Łukasz Gandecki)

### [2.2.0](https://github.com/cucumber/cucumber-js/compare/v2.1.0...v2.2.0) (2017-05-20)

#### New Features

* Add `progress-bar` formatter inspired by [fuubar-cucumber]( https://github.com/martinciu/fuubar-cucumber) and [fuubar](https://github.com/thekompanee/fuubar) which outputs a progress bar and errors as they happen

### [2.1.0](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.9...v2.1.0) (2017-05-12)

#### Bug Fixes

* throw descriptive error message when running a global install

### [1.3.3](https://github.com/cucumber/cucumber-js/compare/v1.3.2...v1.3.3) (2016-04-26)

#### Bug Fixes

* fix unhandled rejections in handlers ([#792](https://github.com/cucumber/cucumber-js/issues/792), yaronassa)

### [1.3.2](https://github.com/cucumber/cucumber-js/compare/v1.3.1...v1.3.2) (2016-03-20)

#### Bug Fixes

* dependency: fix use of gherkin to not rely on removed field

### [2.0.0-rc.9](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.8...v2.0.0-rc.9) (2017-03-16)

#### Bug Fixes

* dependency: fix use of gherkin to not rely on removed field

### [2.0.0-rc.8](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.7...v2.0.0-rc.8) (2017-03-10)

#### Bug Fixes

* generated step definition snippets are not found ([#732](https://github.com/cucumber/cucumber-js/issues/732), Aslak Hellesøy)
* catch attempt to define duplicate parameter type regular expression ([#780](https://github.com/cucumber/cucumber-js/issues/780), Aslak Hellesøy)
* catch errors in parameter type transform functions (Aslak Hellesøy)

#### New Features

* all async parameter type transform functions (Aslak Hellesøy)
* make all formatters available when requiring

#### Deprecations

* `addTransform` was deprecated in favor of `defineParameterType`

#### Documentation

* normalize syntax highlighting ([#726](https://github.com/cucumber/cucumber-js/issues/726), Martin Delille)
* fix setWorldConstructor example

### [2.0.0-rc.7](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.6...v2.0.0-rc.7) (2017-01-30)

#### Bug Fixes

* fix after hook run order ([#743](https://github.com/cucumber/cucumber-js/issues/743))

#### Documentation

* normalize syntax highlighting ([#726](https://github.com/cucumber/cucumber-js/issues/726), (Martin Delille)
* fix addTransform parameter name ([#738](https://github.com/cucumber/cucumber-js/issues/738))

### [2.0.0-rc.6](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.5...v2.0.0-rc.6) (2017-01-06)

#### New Features

* usage and usage-json formatters
* update error reporting for `registerHandler` errors
* add ability to disable timeout

#### Bug Fixes

* update snippets to new support code interface

### [2.0.0-rc.5](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.4...v2.0.0-rc.5) (2016-12-22)

#### Breaking Changes

* Drop support for Node 0.12
* format assertion errors to display diffs

#### Documentation

* fix CLI format-options name ([#703](https://github.com/cucumber/cucumber-js/issues/703), Florian Ribon)
* add link on README.md to custom formatters documentation

### [2.0.0-rc.4](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.3...v2.0.0-rc.4) (2016-12-19)

#### Breaking Changes

* update support code library interface - instead of exporting a function and calling methods on `this`, require the `cucumber` module and call `defineSupportCode` which passes an object as the first argument whch exposes the methods. Overriding the world constructor has changed from overriding the World property to calling `setWorldConstructor`.

    ```javascript
    // 1.3.1
    module.exports = function () {
      this.Given(/^a step$/, function() {});
      this.World = CustomWorld
    });

    // 2.0.0
    var {defineSupportCode} = require('cucumber');

    defineSupportCode(function({Given, setWorldConstructor}) {
      Given(/^a step$/, function() {});
      setWorldConstructor(CustomWorld);
    });
    ```

### [2.0.0-rc.3](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.2...v2.0.0-rc.3) (2016-12-19)

#### Breaking Changes

* make strict the default
  * previously pending and undefined steps did not cause an exit code of 1. This could be overridden with `--strict`. Strict is now the default and you can use `--no-strict` to return to the previous behavior.
* update automatically required files
  * if the features live in a `features` directory at any level, all support files in the `features` directory are loaded.

#### Bug Fixes

* prevent crash on empty feature file

#### New Features

* validate argument types

#### Documentation

* docs: fix tag expression migration guide ([#691](https://github.com/cucumber/cucumber-js/issues/691), Aslak Hellesøy)

### [2.0.0-rc.2](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.1...v2.0.0-rc.2) (2016-12-04)

#### Breaking Changes

* pass `attach` to world constructor instead of assigning it to world
  * the world constructor now receives `{attach, parameters}` as the first argument instead of `parameters`

#### New Features

* json formatter: add `isBackground` to steps

#### Bug Fixes

* clear timeouts of asynchronous hooks/steps
* stop running features with no scenarios

#### Documentation

* update node js example

### [2.0.0-rc.1](https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.0...v2.0.0-rc.1) (2016-11-25)

#### Bug Fixes

* fix browser version

### [2.0.0-rc.0](https://github.com/cucumber/cucumber-js/compare/v1.3.1...v2.0.0-rc.0) (2016-11-25)

#### Breaking Changes

* Dropped support for Node 0.10
* CLI
  * `--colors / --no-colors` has moved to `--format-options '{"colorsEnabled": <BOOLEAN>}'`
  * `--require <DIR|FILE>`: the required files are no longer reordered to require anything in a `support` directory first
  * `--snippet-interface <INTERFACE>` has moved to `--format-options '{"snippetInterface": "<INTERFACE>"}'`
  * `--snippet-syntax <SYNTAX>` has moved to `--format-options '{"snippetSyntax": "<SYNTAX>"}'`
  * `--tags <EXPRESSION>` now uses [cucumber-tag-expressions](https://docs.cucumber.io/tag-expressions/). It is no longer repeatable and new values will override previous
    * `--tags @dev` stays the same
    * `--tags ~@dev` becomes `--tags 'not @dev'`
    * `--tags @foo,@bar` becomes  `--tags '@foo or @bar'`
    * `--tags @foo --tags @bar` becomes `--tags '@foo and @bar'`
* Internals
  * complete rewrite using ES2015 and promises
* JSON Formatter
  * String attachments are no longer base64 encoded. Buffer and Stream attachments are still base64 encoded.
* Support Files
  * Attachments
    * The `attach` function used for adding attachments moved from the API scenario object to world. It is thus now available in step definitions without saving a reference to the scenario.

        ```javascript
        // 1.3.0
        this.After(function(scenario, callback) {
          scenario.attach(new Buffer([137, 80, 78, 71]), 'image/png')
        });

        // 2.0.0
        this.After(function() {
          this.attach(new Buffer([137, 80, 78, 71]), 'image/png');
        });
        ```

    * When attaching buffers or strings, the callback argument is ignored.
  * Hooks
    * Hooks now receive a [ScenarioResult](/src/models/scenario_result.js) instead of the Scenario

        ```javascript
        // 1.3.0
        this.After(function(scenario) {});

        // 2.0.0
        this.After(function(scenarioResult) {});
        ```

    * The `tags` option for hook should now be a string instead of an array and uses [cucumber-tag-expressions](https://docs.cucumber.io/tag-expressions/)

        ```javascript
        // 1.3.0
        this.Before({tags: ["@foo"]}, function (scenario) {})
        this.Before({tags: ["@foo,@bar"]}, function (scenario) {})
        this.Before({tags: ["@foo", "@bar"]}, function (scenario) {})

        // 2.0.0
        this.Before({tags: "@foo"}, function (scenario) {})
        this.Before({tags: "@foo and @bar"}, function (scenario) {})
        this.Before({tags: "@foo or @bar"}, function (scenario) {})
        ```

  * Step Definitions
    * String patterns were removed in favor [cucumber-expressions](https://docs.cucumber.io/cucumber-expressions/)
    * Regular Expressions
      * capture groups matching `(-?\d+)` will be automatically converted to an integer using `parseInt`
      * capture groups matching `(-?\d*\.?\d+)` will be automatically converted to a float using `parseFloat`
    * Generator functions are no longer automatically run with `co`. To retain the previous functionality, use [this.setDefinitionFunctionWrapper](/docs/support_files/step_definitions.md#definition-function-wrapper)
  * Event Handlers
    * Objects no longer have `get*` methods and instead have exposed properties
      * For example: `scenario.getName()` is now just `scenario.name`
    * `StepResult` duration is now in milliseconds instead of nanoseconds

#### Bug Fixes

* remove empty lines from `@rerun` files ([#660](https://github.com/cucumber/cucumber-js/issues/660), Cody Ray Hoeft)
* catch uncaught errors in the browser (Charlie Rudolph)

#### New Features

* Support Files
  * Attachments:
    * When attaching a stream, the interface can either accept a callback as a third argument or will return a promise if not passed a callback
  * Step Definitions
    * Ability to add custom argument transformations
* Fail fast / rerun formatter
  * When used together rerun formatter will output all skipped scenarios that didn't run due to a failure

#### Documentation

* fix typo ([#659](https://github.com/cucumber/cucumber-js/issues/659), gforceg)
* update support files api reference ([#661](https://github.com/cucumber/cucumber-js/issues/661), Zearin)

### [1.3.1](https://github.com/cucumber/cucumber-js/compare/v1.3.0...v1.3.1) (2016-09-30)

#### Bug Fixes

* pass formatter options to listener ([#641](https://github.com/cucumber/cucumber-js/issues/641), Charlie Rudolph)
* rerun formatter: output any scenario that doesn't pass (Charlie Rudolph)
* populate scenario definition ([#647](https://github.com/cucumber/cucumber-js/issues/647), Charlie Rudolph)
* handle empty stacktraces ([#605](https://github.com/cucumber/cucumber-js/issues/605), Hugues Malphettes)
* use cross-platform symbols ([#635](https://github.com/cucumber/cucumber-js/issues/635), Kevin Goslar)

#### Documentation

* fix node.js example ([#637](https://github.com/cucumber/cucumber-js/issues/637), Jonathan Gomez)
* fix links in event_handlers.md ([#638](https://github.com/cucumber/cucumber-js/issues/638), Oliver Rogers)
* fix hooks example ([#644](https://github.com/cucumber/cucumber-js/issues/644), John McLaughlin)

### [1.3.0](https://github.com/cucumber/cucumber-js/compare/v1.2.2...v1.3.0) (2016-09-08)

#### New Features

* add `--snippet-interface <INTERFACE>` CLI option (Charlie Rudolph)
* add `--world-parameters <JSON>` CLI option (Charlie Rudolph)
* add snippets formatter (Charlie Rudolph)
* add support for ES6 default module syntax (dbillingham)
* pretty formatter: add symbols (Charlie Rudolph)
* add simplified hook parameters (Charlie Rudolph)

#### Bug Fixes

* step definition snippets internationalization (Charlie Rudolph)

#### Documentation

* document order of execution for multiple hooks (John McLaughlin)
* breakup README.md, organize docs (Charlie Rudolph)

### [1.2.2](https://github.com/cucumber/cucumber-js/compare/v1.2.1...v1.2.2) (2016-08-05)

#### Bug Fixes

* Fix error when stack trace has no frames ([#610](https://github.com/cucumber/cucumber-js/issues/610), Jan Molak)

### [1.2.1](https://github.com/cucumber/cucumber-js/compare/v1.2.0...v1.2.1) (2016-07-01)

#### Bug Fixes

* Fix hook / step definition location and stacktraces in the browser ([#567](https://github.com/cucumber/cucumber-js/issues/567), [#538](https://github.com/cucumber/cucumber-js/issues/538), Charlie Rudolph)

### [1.2.0](https://github.com/cucumber/cucumber-js/compare/v1.1.0...v1.2.0) (2016-06-24)

#### Bug Fixes

* Attachments
  * Remove intermediate conversion to string (Charlie Rudolph)
  * Use native base64 encoding which can encode binary ([#589](https://github.com/cucumber/cucumber-js/issues/589), Benjamín Eidelman)

### [1.1.0](https://github.com/cucumber/cucumber-js/compare/v1.0.0...v1.1.0) (2016-06-23)

#### New Features

* Add full support to `registerHandler` (Charlie Rudolph)
  * Can now use all supported functions interfaces (synchronous, callback, promise, generators)
  * Will throw any error received and immediately kill the test suite
  * Supports handler specific timeouts
  * Updated documentation

#### Bug Fixes

* CLI format: support absolute path on windows (Charlie Rudolph)
* Fix typo in event name. ([#590](https://github.com/cucumber/cucumber-js/issues/590), Artur Pomadowski)
* Don't run hooks in dry run mode (Charlie Rudolph)

### [1.0.0](https://github.com/cucumber/cucumber-js/compare/v0.10.4...v1.0.0) (2016-05-30)

#### Bug Fixes

* Escape all instances of special characters in example / data table  (Charlie Rudolph)

### [0.10.4](https://github.com/cucumber/cucumber-js/compare/v0.10.3...v0.10.4) (2016-05-30)

#### New Features

* Allow time to be faked by utilities such as `sinon.useFakeTimers` (John McLaughlin)

### [0.10.3](https://github.com/cucumber/cucumber-js/compare/v0.10.2...v0.10.3) (2016-05-19)

#### Bug Fixes

* Escape newlines in table cells in pretty formatter (Julien Biezemans)
* Fix handling of unusual error objects (efokschaner)

### [0.10.2](https://github.com/cucumber/cucumber-js/compare/v0.10.1...v0.10.2) (2016-04-07)

#### New Features

* Add match location to JSON formatter output (Charlie Rudolph)

#### Bug Fixes

* Undefined background step (Scott Deakin)

### [0.10.1](https://github.com/cucumber/cucumber-js/compare/v0.10.0...v0.10.1) (2016-04-01)

#### New Features

* Support generators for hooks/step definitions (Ádám Gólya)

### [0.10.0](https://github.com/cucumber/cucumber-js/compare/v0.9.5...v0.10.0) (2016-04-01)

#### Breaking changes

* removed around hooks (Charlie Rudolph)
  * how to update: use separate before and after hooks. If this is not sufficient, please create an issue.

* updated pending step interface (Charlie Rudolph)
  * how to update: change `callback.pending()` to `callback(null, 'pending')` or use one of the new pending step interfaces

* updated tagged hook interface (Charlie Rudolph)
  * how to update:

    ```javascript
    this.Before('@tagA', function() { ... })
    // becomes
    this.Before({tags: ['@tagA']}, function() { ... })

    this.Before('@tagA', '@tagB,@tagC', function() { ... })
    // becomes
    this.Before({tags: ['@tagA', '@tagB,@tagC']}, function() { ... })
    ```


#### New Features

* support hook specific timeouts (Charlie Rudolph)
* reworked formatter error reporting (Charlie Rudolph)

### [0.9.5](https://github.com/cucumber/cucumber-js/compare/v0.9.4...v0.9.5) (2016-02-16)

#### Bug Fixes

* Fix rerun formatter output (Charlie Rudolph)

#### New Features

* Allow rerun file to be in subfolder (Charlie Rudolph)

### [0.9.4](https://github.com/cucumber/cucumber-js/compare/v0.9.3...v0.9.4) (2016-01-28)

#### Bug Fixes

* Publish release folder to npm  (Charlie Rudolph)

### [0.9.3](https://github.com/cucumber/cucumber-js/compare/v0.9.2...v0.9.3) (2016-01-27)

#### New Features

* Run scenario by name (Charlie Rudolph)

#### Bug Fixes

* Prevent maximum call stack from being exceeded (John Krull)

#### Documentation

* Add documentation of profiles (Charlie Rudolph)
* README improvements (Miika Hänninen, Kevin Goslar, Maxim Koretskiy)

### [0.9.2](https://github.com/cucumber/cucumber-js/compare/v0.9.1...v0.9.2)

#### New Features

* Bump stack-chain (Rick Lee-Morlang)

### [0.9.1](https://github.com/cucumber/cucumber-js/compare/v0.9.0...v0.9.1)

#### New Features

* Add rerun formatter (Charlie Rudolph)

#### Fixes

* Add ability to execute scenario outline example (Charlie Rudolph)
* Support tags on scenario outline examples (Charlie Rudolph)

#### Documentation

* Fix invalid hook documentation (Charlie Rudolph)

### [0.9.0](https://github.com/cucumber/cucumber-js/compare/v0.8.1...v0.9.0)

#### Breaking changes

* catch ambiguous step definitions (Charlie Rudolph)
* remove use of domain (Charlie Rudolph)

#### New Features

* pretty formatter: source shows step definition location (Charlie Rudolph)
* support node 5 (Charlie Rudolph)

#### Fixes

* Fix `Api.Scenario#attach` callback handling (Julien Biezemans)

#### Documentation

* Add async example to README (Artem Bronitsky)
* Document hooks sync/async protocols (Julien Biezemans)
* Remove useless callbacks in documentation (Julien Biezemans)
* Fix browser example (Karine Pires)

### [v0.8.1](https://github.com/cucumber/cucumber-js/compare/v0.8.0...v0.8.1)

#### Documentation, internals and tests

* Update World constructor documentation (Charlie Rudolph)
* Remove badges from README.md (Charlie Rudolph)

### [v0.8.0](https://github.com/cucumber/cucumber-js/compare/v0.7.0...v0.8.0)

#### Breaking changes

* Add strict function length checking to hooks and step definitions (Charlie Rudolph)
* Make World constructors strictly synchronous (Julien Biezemans)

#### New features

* Add cli option to fail fast (Charlie Rudolph)
* Add cli for specifying multiple formatters (Charlie Rudolph)
* Add support for passing multiple line numbers (Charlie Rudolph)
* Add ability to disable colors (Charlie Rudolph)
* Add support for custom snippet syntaxes (Charlie Rudolph)

#### Changed features

* Hide errors in pretty formatter summary (Charlie Rudolph)
* Remove unnecessary whitespaces in pretty formatter output (Charlie Rudolph)

#### Fixes

* Properly ask configurations for strict mode (Julien Biezemans)

#### Documentation, internals and tests

* Document data table interface (Charlie Rudolph)
* Refactor: statuses (Charlie Rudolph)
* Refactor: cleanup step definitions (Charlie Rudolph)
* Cleanup: remove log to console from listeners (Charlie Rudolph)
* Use svg badges (Charlie Rudolph)
* Rename CONTRIBUTE.md to CONTRIBUTING.md (Julien Biezemans)
* Require maintainers to document API changes in release tag descriptions (Julien Biezemans)
* Add build-release NPM script (Julien Biezemans)

### [v0.7.0](https://github.com/cucumber/cucumber-js/compare/v0.6.0...v0.7.0)

#### New features

* Time out steps that take too long (Charles Rudolph)
* Print execution time (Charles Rudolph)

#### Changed features

* Remove callback.fail() (Charles Rudolph)
* Update hooks interface (Charles Rudolph)

#### Fixes

* Don't try to handle empty features (Julien Biezemans)
* Fix unpredictable nopt behavior (Charles Rudolph)
* Fix pretty formatter step indentation after doc string (Charles Rudolph)

#### Documentation, internals and tests

* Rename Collection functions: forEach/syncForEach -> asyncForEach/forEach (Charles Rudolph)
* Simplify installation instructions (Charles Rudolph)
* Fix spec on Windows (Marcel Hoyer)
* Simplify World examples in README (Charles Rudolph)
* Update license in package.json (Charles Rudolph)
* Convert test framework from jasmine-node to jasmine (Charles Rudolph)
* Separate test output (Charles Rudolph)
* Remove ruby, legacy features, cucumber-tck (Charles Rudolph)

### [v0.6.0](https://github.com/cucumber/cucumber-js/compare/v0.5.3...v0.6.0)

#### New features

* Add --no-source to hide uris (Eddie Loeffen)
* Add dry run capability (Karthik Viswanath)
* Introduce --compiler CLI option (Charles Rudolph)

#### Documentation, internals and tests

* Stop IRC and email notifications from Travis (Julien Biezemans)
* Remove Node.js 0.11 explicit support (Julien Biezemans)
* Use basic for loop for array iterations (Charles Rudolph)
* Bump browserify (Charles Rudolph)
* Add CLI help for --profile (Charles Rudolph)
* Use colors library (Charles Rudolph)
* Improve --compiler help (Julien Biezemans)
* Fix loading of external compiler modules (Julien Biezemans)
* Document a few common compiler usages (Julien Biezemans)

### [v0.5.3](https://github.com/cucumber/cucumber-js/compare/v0.5.2...v0.5.3)

#### New features

* Add support for profiles (Charles Rudolph)

#### Changed features

* Allow for multiple instances of placeholder (Charles Rudolph)
* Print relative paths in summary output (Charles Rudolph)

#### Fixes

* Remove duplicate line number from output (Charles Rudolph)
* Return clone of array from DataTable.Row.raw() (Julien Biezemans)

#### Documentation, internals and tests

* Update various urls (Dale Gardner)
* Bump CoffeeScript (Julien Biezemans)
* Bump PogoScript (Julien Biezemans)
* Bump underscore (Julien Biezemans)
* Bump underscore.string (Julien Biezemans)
* Bump stack-chain (Julien Biezemans)
* Bump nopt (Julien Biezemans)
* Bump connect (Julien Biezemans)
* Bump exorcist (Julien Biezemans)
* Bump uglifyify (Julien Biezemans)
* Bump through (Julien Biezemans)
* Bump serve-static (Julien Biezemans)
* Bump rimraf (Julien Biezemans)
* Bump mkdirp (Julien Biezemans)
* Bump jshint (Julien Biezemans)
* Remove extra bracket in README example (Julien Biezemans)
* Officially support Node.js 4.x (Julien Biezemans)
* Use a profile for own build (Julien Biezemans)

### [v0.5.2](https://github.com/cucumber/cucumber-js/compare/v0.5.1...v0.5.2)

#### New features

* Add rowsHash method to data tables (Mark Amery)

#### Documentation, internals and tests

* Remove CLI resource leak timeout (Julien Biezemans)
* Point to cucumber.io instead of cukes.info (Julien Biezemans)
* Fix mixed tabs and spaces (Mark Amery)
* Use hexadecimal values for console colours (Julien Biezemans)
* Update walkdir module to 0.0.10 (Artem Repko)
* Fix ruby tests on Windows (zs-zs)
* Fix npm test to run on Windows (zs-zs)
* Normalize OS-specific path separators in output assertions (zs-zs)
* Relax check for promises in step definitions (zs-zs)
* Add Ast.Feature.getFeatureElements() (Mark Derbecker)
* Add Util.Collection.sort() (Mark Derbecker)
* Add waffle.io badge (Julien Biezemans)

### [v0.5.1](https://github.com/cucumber/cucumber-js/compare/v0.5.0...v0.5.1)

#### New features

* Support placeholders in scenario outlines (chrismilleruk)
* Add failure exception to scenario object (Mateusz Derks)

#### Documentation, internals and tests

* Fix World example in README (Julien Biezemans)
* Remove moot `version` property from bower.json (Kevin Kirsche)
* Remove obsolete release instruction for bower (Julien Biezemans)
* Add Gitter badge (Julien Biezemans)
* Rephrase spec example (Julien Biezemans)
* Add documentation for attachments (Simon Dean)
* Fix name of Cucumber.Api.Scenario in README (Simon Dean)

### [v0.5.0](https://github.com/cucumber/cucumber-js/compare/v0.4.9...v0.5.0)

#### New features

* Support promises from step definitions (Will Farrell)
* Support synchronous step definitions (Julien Biezemans)

#### Documentation, internals and tests

* Remove irrelevant feature file (Julien Biezemans)
* Reorganise callback feature (Julien Biezemans)
* Remove unused dependency (Julien Biezemans)
* Document new step definition styles (Julien Biezemans)
* Make step definitions synchronous in example app (Julien Biezemans)

### [v0.4.9](https://github.com/cucumber/cucumber-js/compare/v0.4.8...v0.4.9)

#### New features

* Make pretty formatter the default (Julien Biezemans)
* Filter stack traces (close [#157](https://github.com/cucumber/cucumber-js/issues/157), Julien Biezemans)

#### Documentation, internals and tests

* Separate source map from bundle (Julien Biezemans)
* Hint (Julien Biezemans)
* Fix misspelling io.js (Sonny Piers)
* Add 0.12 to supported engines in NPM manifest (Julien Biezemans)
* Fix test script to be more portable (Sam Saccone)
* Force Cucumber <2 for now (Julien Biezemans)
* Bump Cucumber gem to 2.0.0 (Julien Biezemans)
* Explicitly require json module in Ruby stepdefs (Julien Biezemans)
* Add CLI help section for --backtrace (Julien Biezemans)

### [v0.4.8](https://github.com/cucumber/cucumber-js/compare/v0.4.7...v0.4.8)

#### New features

* Support IO.js (Sam Saccone)
* Support Node.js 0.12 (Julien Biezemans)

#### Fixes

* Handle BOM and fix regexp for hyphenated languages ([#144](https://github.com/cucumber/cucumber-js/issues/144), Aslak Hellesøy)
* Fix attachment clean up in hooks ([#282](https://github.com/cucumber/cucumber-js/issues/282), nebehr)

#### Documentation, internals and tests

* More thorough specs for GherkinLexer. Fix build? (Aslak Hellesøy)
* Add jshintrc (Jesse Harlin)
* Hint lib/ (Julien Biezemans)
* Hint bundler and bin (Julien Biezemans)
* Hint spec/ (Julien Biezemans)
* Be consistent in anonymous function syntax (Julien Biezemans)
* Use named functions for all constructors (Julien Biezemans)
* Indent (Julien Biezemans)
* Add more diagnostics to build (Julien Biezemans)
* Remove unnecessary spaces in shell commands (Julien Biezemans)

### [v0.4.7](https://github.com/cucumber/cucumber-js/compare/v0.4.6...v0.4.7)

#### Documentation, internals and tests

* Do not dispose of step domains (Julien Biezemans)
* Refactor and add debug code (Julien Biezemans)
* Create a single domain per run (Julien Biezemans)
* Add missing AstTreeWalker specs (Julien Biezemans)
* Indent (Julien Biezemans)
* Spec domain enter/exit in AstTreeWalker (Julien Biezemans)

### [v0.4.6](https://github.com/cucumber/cucumber-js/compare/v0.4.5...v0.4.6)

#### New features

* Add --no-snippets flag to CLI (close [#207](https://github.com/cucumber/cucumber-js/issues/207), Krispin Schulz)
* Add strict mode (close [#211](https://github.com/cucumber/cucumber-js/issues/211), Elwyn)
* Add strict mode to volatile configuration (close [#258](https://github.com/cucumber/cucumber-js/issues/258), Jan-Eric Duden)

#### Fixes

* Fix code loader on windows (close [#226](https://github.com/cucumber/cucumber-js/issues/226), Gary Taylor)

#### Documentation, internals and tests

* Connect to Rubygems through SSL (Julien Biezemans)
* Use Node domain's enter/exit in stepdefs (Julien Biezemans)
* Do not display snippets in build (Julien Biezemans)
* Asynchronously dispose of step domains (Julien Biezemans)
* Change order of tests in build (Julien Biezemans)
* Fix tests to run on Windows (close [#216](https://github.com/cucumber/cucumber-js/issues/216), kostya.misura)
* Fix registerHandler() example in README (Julien Biezemans)
* Fix typo in variable name (Julien Biezemans)
* Fix World property assignment in README example (Julian)
* Unix EOLs (Julien Biezemans)
* Ignore .ruby-* (Julien Biezemans)

### [v0.4.5](https://github.com/cucumber/cucumber-js/compare/v0.4.4...v0.4.5)

#### Documentation, internals and tests

* Fix issue with npm upgrade on node.js v0.8 (Simon Dean)
* Use Node domain to handle asynchronous exceptions (Julien Biezemans)

### [v0.4.4](https://github.com/cucumber/cucumber-js/compare/v0.4.3...v0.4.4)

#### Fixes

* Allow >1 parameter in string step definitions (Craig Morris)
* Don't skip scenario outlines (close [#245](https://github.com/cucumber/cucumber-js/issues/245), Julien Biezemans)

#### Documentation, internals and tests

* Bump nopt (Julien Biezemans)
* Bump coffee-script (Julien Biezemans)
* Bump pogo (Julien Biezemans)
* Bump underscore (Julien Biezemans)
* Bump rimraf (Julien Biezemans)
* Bump jasmine-node (Julien Biezemans)
* Bump connect (Julien Biezemans)
* Rewrite bundling system (close [#186](https://github.com/cucumber/cucumber-js/issues/186), Julien Biezemans)
* Rename release script (Julien Biezemans)
* Upgrade NPM on Travis (Julien Biezemans)
* Drop Node 0.6 support (Julien Biezemans)
* Drop Node 0.6 support (manifest) (Julien Biezemans)

### [v0.4.3](https://github.com/cucumber/cucumber-js/compare/v0.4.2...v0.4.3)

#### Fixes

* Scenario outline fixes (Simon Dean)
* Correct the embeddings JSON to match other ports of Cucumber (Simon Dean)

### [v0.4.2](https://github.com/cucumber/cucumber-js/compare/v0.4.1...v0.4.2)

#### New features

* Support attachments (close [#189](https://github.com/cucumber/cucumber-js/issues/189), Julien Biezemans)

#### Documentation, internals and tests

* Fix world example in main readme (Sam Saccone)
* Update instructings for running tests (Sam Saccone)

### [v0.4.1](https://github.com/cucumber/cucumber-js/compare/v0.4.0...v0.4.1)

#### New features

* Target scenario by line number on CLI (close [#168](https://github.com/cucumber/cucumber-js/issues/168), Simon Lampen)

#### Fixes

* Ensure no stdout output is lost (Simon Dean)
* Properly tag scenario outlines (close [#195](https://github.com/cucumber/cucumber-js/issues/195), [#197](https://github.com/cucumber/cucumber-js/issues/197), Artur Kania)

#### Documentation, internals and tests

* Align snippet comment with Cucumber-Ruby/JVM (close [#150](https://github.com/cucumber/cucumber-js/issues/150), Julien Biezemans)
* Update build badge URL on README (Julien Biezemans)
* Add line number pattern to --help on CLI (Julien Biezemans)
* Document AfterFeatures event (close [#171](https://github.com/cucumber/cucumber-js/issues/171), Eddie Loeffen)
* Include 'features' in *Features events payload (Stanley Shyiko)
* Try to fix build on Travis (Julien Biezemans)
* Remove bower as a dev dependency (close [#191](https://github.com/cucumber/cucumber-js/issues/191), Simon Dean)
* Remove obsolete Travis trick for Node 0.8 (Julien Biezemans)
* Remove development status table from README (Julien Biezemans)
* Help the guy produce changelogs (Julien Biezemans)

### [v0.4.0](https://github.com/cucumber/cucumber-js/compare/v0.3.3...v0.4.0)

#### New features

* Add support for scenario outlines and examples (close [#155](https://github.com/cucumber/cucumber-js/issues/155), Ben Van Treese)
* Add i18n support (close [#156](https://github.com/cucumber/cucumber-js/issues/156), Lukas Degener)

#### Changed features

* Pass scenario to hooks (Marat Dyatko)
* Minor change to stepdef snippets (JS) (Julien Biezemans)
* Make feature id in JSON output replace all spaces (close #[127](https://github.com/cucumber/cucumber-js/issues/127), Tim Perry)
* Bump CoffeeScript (close [#154](https://github.com/cucumber/cucumber-js/issues/154), Gabe Hayes)

#### Documentation, internals and tests

* Add Hook spec example for single-arg function (close [#143](https://github.com/cucumber/cucumber-js/issues/143), Julien Biezemans)
* Update README with Hook scenario object doc (Julien Biezemans)
* Style (Julien Biezemans)

### [v0.3.3](https://github.com/cucumber/cucumber-js/compare/v0.3.2...v0.3.3)

#### New features

* Output step definition snippets in CoffeeScript (John George Wright)
* Add colors to CLI (Johny Jose)

#### Changed features

* Add durations to JSON formatter (Simon Dean)

#### Documentation, internals and tests

* Bump most dependencies (Julien Biezemans)
* DRY (Julien Biezemans)
* Refactor (Julien Biezemans)

### [v0.3.2](https://github.com/cucumber/cucumber-js/compare/v0.3.1...v0.3.2)

#### New features

* Add PogoScript support (Josh Chisholm)
* Add listener and event handler registration (close [#130](https://github.com/cucumber/cucumber-js/issues/130), Paul Shannon)

#### Documentation, internals and tests

* Added some nice stats (Aslak Hellesøy)
* Fix spelling of "GitHub" (Peter Suschlik)
* Add Code Climate badge to README (Julien Biezemans)
* Update README.md (Sebastian Schürmann)

### [v0.3.1](https://github.com/cucumber/cucumber-js/compare/v0.3.0...v0.3.1)

#### New features

* Add DataTable.rows() (Niklas Närhinen)
* Officially support Node 0.10 and 0.11 (Julien Biezemans)

#### Changed features

* Update cucumber-html (Aslak Hellesøy)
* Bump Gherkin (Julien Biezemans)
* Add options parameter to JSON formatter (Israël Hallé)
* Updated CoffeeScript (Matteo Collina)
* Specify strict coffee-script version number (Julien Biezemans)
* Bump jasmine-node (Julien Biezemans)

#### Fixes

* Fix travis build Node versions (Julien Biezemans)
* Fix Travis CI configuration (Julien Biezemans)

#### Documentation, internals and tests

* Remove words in History (Julien Biezemans)
* Update dev status table in README (Julien Biezemans)
* Update LICENSE (Julien Biezemans)
* Add contributors (Julien Biezemans)
* Move data table scenario to TCK (Julien Biezemans)
* Be consistent in spec matchers (Julien Biezemans)
* Remove cucumber.no.de links	(Kim, Jang-hwan)
* Fix broken link in README dev status table ([#118](https://github.com/cucumber/cucumber-js/issues/118), Michael Zedeler)
* Refactor hook-related Given steps in JS stepdefs (Julien Biezemans)
* Refactor failing mapping JS step definitions (Julien Biezemans & Matt Wynne)
* Update README.md to correct error in example for zombie initialization (Tom V)
* Update minor typos in README.md (David Godfrey)



### [v0.3.0](https://github.com/cucumber/cucumber-js/compare/v0.2.22...v0.3.0)

#### New features

* Allow for node-like callback errors (Julien Biezemans)
* Accept multiple features in volatile configuration ([#52](https://github.com/cucumber/cucumber-js/issues/52), Julien Biezemans)

#### Fixes

* Add ^ prefix and $ suffix to string-based step definition regexps ([#77](https://github.com/cucumber/cucumber-js/issues/77), Julien Biezemans)
* Allow for unsafe regexp characters in stepdef string patterns ([#77](https://github.com/cucumber/cucumber-js/issues/77), Julien Biezemans)

#### Documentation, internals and tests

* Build on Node.js 0.8 on Travis (Julien Biezemans)
* Rewrite README's status table in HTML (Julien Biezemans)
* Bump Gherkin ([#78](https://github.com/cucumber/cucumber-js/issues/78), Julien Biezemans)
* Switch to HTML tables in README (Julien Biezemans)
* Bump Aruba (Julien Biezemans)



## [v0.2.x](https://github.com/cucumber/cucumber-js/compare/v0.2.0...v0.3.0^)

### [v0.2.22](https://github.com/cucumber/cucumber-js/compare/v0.2.21...v0.2.22)

#### New features

* Print data tables and doc strings in pretty formatter output ([#89](https://github.com/cucumber/cucumber-js/issues/89), [#81](https://github.com/cucumber/cucumber-js/issues/81), Julien Biezemans)

#### Fixes

* Exclude unmatched features from AST ([#80](https://github.com/cucumber/cucumber-js/issues/80), Julien Biezemans)



### [v0.2.21](https://github.com/cucumber/cucumber-js/compare/v0.2.20...v0.2.21)

#### New features

* Add bundler (Julien Biezemans)



**TBD**

### [v0.2.20](https://github.com/cucumber/cucumber-js/compare/v0.2.19...v0.2.20)

#### New features

* Add JSON formatter ([#79](https://github.com/cucumber/cucumber-js/issues/79), Chris Young)

#### Fixes

* Fix data table and tags handling in JSON formatter (Julien Biezemans)

#### Documentation, internals and tests

* Force example feature execution order in JSON feature (Julien Biezemans)



### [v0.2.19](https://github.com/cucumber/cucumber-js/compare/v0.2.18...v0.2.19)

#### Fixes

* Fix CLI arguments passing ([#83](https://github.com/cucumber/cucumber-js/issues/83), Omar Gonzalez)

#### Documentation, internals and tests

* Refactor "summarizer" listener to summary formatter ([#71](https://github.com/cucumber/cucumber-js/issues/71), 28b74ef, Julien Biezemans)
* Add "summary" formatter to available CLI formatters (Julien Biezemans)
* Fix spec example description (Julien Biezemans)



### [v0.2.18](https://github.com/cucumber/cucumber-js/compare/v0.2.17...v0.2.18)

#### Fixes

* Replace findit with walkdir to fix file loading on Windows ([#73](https://github.com/cucumber/cucumber-js/issues/73), Aaron Garvey)

#### Documentation, internals and tests

* Rename spec file (Julien Biezemans)
* Extract developer documentation from README to CONTRIBUTE (Julien Biezemans)
* Bump browserify (Julien Biezemans)
* Update supported Node.js versions (Julien Biezemans)



### [v0.2.17](https://github.com/cucumber/cucumber-js/compare/v0.2.16...v0.2.17)

#### New features

* Add pretty formatter (simplified, monochrome) ([#59](https://github.com/cucumber/cucumber-js/issues/59), @renier, Julien Biezemans)

#### Documentation, internals and tests

* Display only master branch build status in README (Julien Biezemans)
* Rename "summary logger" to "summarizer" ([#59](https://github.com/cucumber/cucumber-js/issues/59), Julien Biezemans)
* Extract common formatter methods ([#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)



### [v0.2.16](https://github.com/cucumber/cucumber-js/compare/v0.2.15...v0.2.16)

#### New features

* Display failing scenario URIs in summary (Julien Biezemans)

#### Documentation, internals and tests

* Ran a gem update (Aslak Hellesøy)
* Update NPM dependencies ([#69](https://github.com/cucumber/cucumber-js/issues/69), Aslak Hellesøy)
* Refactor listener infrastructure ([#35](https://github.com/cucumber/cucumber-js/issues/35), [#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)
* Extract summary logger from progress formatter ([#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)
* Store URI on AST elements (Julien Biezemans)



### [v0.2.15](https://github.com/cucumber/cucumber-js/compare/v0.2.14...v0.2.15)

#### New features

* Handle asynchronous exceptions ([#51](https://github.com/cucumber/cucumber-js/issues/51), Julien Biezemans)

#### Documentation, internals and tests

* Remove commented code (Julien Biezemans)



### [v0.2.14](https://github.com/cucumber/cucumber-js/compare/v0.2.13...v0.2.14)

#### New features

* Mention CS support in README (Julien Biezemans)
* Update command-line documentation in README (Julien Biezemans)

#### Fixes

* Add alternate binary script for Windows ([#60](https://github.com/cucumber/cucumber-js/issues/60), Julien Biezemans)



### [v0.2.13](https://github.com/cucumber/cucumber-js/compare/v0.2.12...v0.2.13)

#### New features

* Add support for string-based step definition patterns ([#48](https://github.com/cucumber/cucumber-js/issues/48), Ted de Koning, Julien Biezemans)

#### Documentation, internals and tests

* Pass step instance to step definition invocation ([#57](https://github.com/cucumber/cucumber-js/issues/57), Julien Biezemans)
* Refactor step result specs (Julien Biezemans)
* Store step on step results ([#57](https://github.com/cucumber/cucumber-js/issues/57), Julien Biezemans)
* Increase Aruba timeout delay for slow Travis (Julien Biezemans)
* Decouple pattern from regexp in step definition ([#48](https://github.com/cucumber/cucumber-js/issues/48), Julien Biezemans)



### [v0.2.12](https://github.com/cucumber/cucumber-js/compare/v0.2.11...v0.2.12)

#### Changed features

* Allow World constructor to set explicit World object ([#50](https://github.com/cucumber/cucumber-js/issues/50), Julien Biezemans)

#### Documentation, internals and tests

* Add semicolons (Julien Biezemans)
* Add documentation about World to README (Julien Biezemans)



### [v0.2.11](https://github.com/cucumber/cucumber-js/compare/v0.2.10...v0.2.11)

#### Changed features

* Simplify World callbacks ([#49](https://github.com/cucumber/cucumber-js/issues/49), Julien Biezemans)

#### Fixes

* Fix callback.fail() when called without any reasons (Julien Biezemans)

#### Documentation, internals and tests

* Add toHaveBeenCalledWithInstanceOfConstructorAsNthParameter() spec helper (Julien Biezemans)
* Simplify default World constructor callback (Julien Biezemans)
* Adapt World constructors (Julien Biezemans)



### [v0.2.10](https://github.com/cucumber/cucumber-js/compare/v0.2.9...v0.2.10)

#### Fixes

* Fix path handling on Windows platforms ([#47](https://github.com/cucumber/cucumber-js/issues/47), Julien Biezemans)

#### Documentation, internals and tests

* Add tagged hooks example to README (Julien Biezemans)
* Fix browserify setup for example page load (Julien Biezemans)
* Rename bundle to 'cucumber.js' in web example (Julien Biezemans)
* Remove obsolete browserify directive (Julien Biezemans)
* Improve platform detection (Julien Biezemans)



### [v0.2.9](https://github.com/cucumber/cucumber-js/compare/v0.2.8...v0.2.9)

#### New features

* Add support for tagged hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)

#### Changed features

* Allow for whitespaces in tag groups (Julien Biezemans)

#### Documentation, internals and tests

* Add Cucumber.Type.String and String#trim(, Julien Biezemans)
* Remove unnecessary this. from stepdefs (Julien Biezemans)
* Simplify tag-related stepdefs (Julien Biezemans)
* Simplify tag selection syntax in volatile configuration (Julien Biezemans)
* Mark hooks "done" in README dev status (Julien Biezemans)



### [v0.2.8](https://github.com/cucumber/cucumber-js/compare/v0.2.7...v0.2.8)

#### New features

* Add around hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)

#### Changed features

* Treat undefined and skipped step as any other step (Julien Biezemans)

#### Documentation, internals and tests

* Remove unused parameter in parser spec (Julien Biezemans)
* Add JS stepdef for async failing steps scenario (Julien Biezemans)
* Assign zombie in README example ([#44](https://github.com/cucumber/cucumber-js/issues/44), Julien Biezemans)
* Remove trailing spaces (Julien Biezemans)
* Get rid of obsolete PendingStepException (Julien Biezemans)
* Refactor SupportCode.Library spec (Julien Biezemans)
* Add around hooks documentation ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)



### [v0.2.7](https://github.com/cucumber/cucumber-js/compare/v0.2.6...v0.2.7)

#### New features

* Allow for asynchronous pending steps (Julien Biezemans)
* Allow for asynchronous step failures (Julien Biezemans)

#### Fixes

* Fix matching groups in step definition snippets ([#42](https://github.com/cucumber/cucumber-js/issues/42), Julien Biezemans)
* Remove obsolete dependency from snippet builder spec (Julien Biezemans)

#### Documentation, internals and tests

* Add steps to release process in README (Julien Biezemans)
* Update development status table in README (Julien Biezemans)
* Import implementation-specific scenarios from cucumber-tck/undefined_steps (Julien Biezemans)
* Switch from throwing exceptions to callback.fail() in web example (Julien Biezemans)
* Add callback.fail() example to README (Julien Biezemans)

### [v0.2.6](https://github.com/cucumber/cucumber-js/compare/v0.2.5...v0.2.6)

#### New features

* Add tags support ([#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
* Add support for tags on features ([#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)

#### Changed features

* Handle missing instance in World constructor callback ([#40](https://github.com/cucumber/cucumber-js/issues/40), Julien Biezemans)

#### Documentation, internals and tests

* Update development status in README (Julien Biezemans)
* Typo in README (Julien Biezemans)
* Refactor parser and add AST assembler (required by [#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
* Indent properly (Julien Biezemans)
* Refactor AST assembler to be stateful (needed by [#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
* Update master diff in History (Julien Biezemans)
* Add --tags documentation to --help (CLI, Julien Biezemans)



### [v0.2.5](https://github.com/cucumber/cucumber-js/compare/v0.2.4...v0.2.5)

#### New features

* Add Before/After hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), [#31](https://github.com/cucumber/cucumber-js/issues/31), Tristan Dunn)

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
* Make and expect World constructors to be asynchronous ([#39](https://github.com/cucumber/cucumber-js/issues/39), Julien Biezemans)

#### Documentation, internals and tests

* Update README (Julien Biezemans)
* Add development status to README (Julien Biezemans)
* Add link to demo at cucumber.no.de (Julien Biezemans)
* Add link to example app to README (Julien Biezemans)
* Add usage documentation to README ([#23](https://github.com/cucumber/cucumber-js/issues/23), Olivier Melcher)
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

* Suggest step definition snippets for undefined steps ([#33](https://github.com/cucumber/cucumber-js/issues/33), Julien Biezemans)

#### Documentation, internals and tests

* Add contributors to NPM package manifest (Julien Biezemans)
* Clean up JS step definitions (Julien Biezemans)
* Bump cucumber-features and reflect step changes (Julien Biezemans)
* Set up [continuous integration on Travis CI](http://travis-ci.org/#!/cucumber/cucumber-js) (Julien Biezemans)
* Add Travis's build status icon to README (Julien Biezemans)



### [v0.2.1](https://github.com/cucumber/cucumber-js/compare/v0.2.0...v0.2.1)

#### New features

* Allow custom World constructors (Julien Biezemans)
* Add support for data tables (with conversion to hashes) ([#12](https://github.com/cucumber/cucumber-js/issues/12), Julien Biezemans)

#### Changed features

* Demonstrate World object usages in web example (Julien Biezemans)



### [v0.2.0](https://github.com/cucumber/cucumber-js/compare/v0.1.5...v0.2.0)

#### New features

* Setup application to run on [Travis CI](http://travis-ci.org/#!/jbpros/cucumber-js) (Julien Biezemans)
* Add CoffeeScript support for step definition files (Paul Jensen)
* Add "World" ([#26](https://github.com/cucumber/cucumber-js/issues/26), Julien Biezemans)

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
* Add feature for CoffeeScript support ([#29](https://github.com/cucumber/cucumber-js/issues/29), Julien Biezemans)



## [v0.1.x](https://github.com/cucumber/cucumber-js/compare/v0.1.0...v0.2.0^)

### [v0.1.5](https://github.com/cucumber/cucumber-js/compare/v0.1.4...v0.1.5)

#### New features

* Add support for background ([#9](https://github.com/cucumber/cucumber-js/issues/9), Julien Biezemans)

#### Documentation, internals and tests

* Bump cucumber-features (twice) (Julien Biezemans)
* Bump gherkin and reflect changes in its API (add DocString content type) (Julien Biezemans)



### [v0.1.4](https://github.com/cucumber/cucumber-js/compare/v0.1.3...v0.1.4)

#### Changed features

* Stop polluting the global namespace with Given(), When() and Then() ([#2](https://github.com/cucumber/cucumber-js/issues/2), Julien Biezemans)
* Step definitions can be created with the support code helper passed as 'this':
  this.Given(), this.When(), this.Then() and this.defineStep() ([#2](https://github.com/cucumber/cucumber-js/issues/2), Julien Biezemans)

#### Documentation, internals and tests

* Fix typo "occured" -> "occurred" (Fernando Acorreia)
* Improve variable names in CLI support code loader (Julien Biezemans)



### [v0.1.3](https://github.com/cucumber/cucumber-js/compare/v0.1.2...v0.1.3)

#### New features

* Allow several features to run at once ([#14](https://github.com/cucumber/cucumber-js/issues/14), Julien Biezemans)
* Add support for --require (Julien Biezemans)

#### Documentation, internals and tests

* Improve features and support code API (Julien Biezemans)
* Add "Cli" and "Volatile" configurations (Julien Biezemans)
* Internal refactoring and cleanup (Julien Biezemans)
* Cucumber.js can now fully test itself (Julien Biezemans)
* Remove run_all_features script in favor of bin/cucumber.js (Julien Biezemans)



### [v0.1.2](https://github.com/cucumber/cucumber-js/compare/v0.1.1...v0.1.2)

#### New features

* Add failure reporting to the progress formatter ([#20](https://github.com/cucumber/cucumber-js/issues/20), Julien Biezemans)



### [v0.1.1](https://github.com/cucumber/cucumber-js/compare/v0.1.0...v0.1.1)

#### New features

* Publish Cucumber.js to NPM as [`cucumber`](http://search.npmjs.org/#/cucumber) (Julien Biezemans)

#### Changed features

* Throw a clearer exception on missing feature argument (CLI) (Julien Biezemans)

#### Documentation, internals and tests

* Unify and clean up js-specific features and step definitions ([#21](https://github.com/cucumber/cucumber-js/issues/21), Julien Biezemans)



### [v0.1.0](https://github.com/cucumber/cucumber-js/compare/v0.0.1...v0.1.0)

#### New features

* Add cucumber.js executable (Julien Biezemans)
* Handle step failures ([#6](https://github.com/cucumber/cucumber-js/issues/6), Julien Biezemans)
* Add the progress formatter ([#16](https://github.com/cucumber/cucumber-js/issues/16), Julien Biezemans)
* Add support for pending steps ([#18](https://github.com/cucumber/cucumber-js/issues/18), Julien Biezemans)
* Add support for undefined steps ([#19](https://github.com/cucumber/cucumber-js/issues/19), Julien Biezemans)

#### Changed features

* Update web example to use the new progress formatter (Julien Biezemans)

#### Fixes

* Fix asynchronous step definition callbacks ([#1](https://github.com/cucumber/cucumber-js/issues/1), Julien Biezemans)
* Fix stepResult.isSuccessful call in ProgressFormatter (Julien Biezemans)
* Load Gherkin properly in browsers (Julien Biezemans)
* Remove calls to console.log in web example (Julien Biezemans)

#### Documentation, internals and tests

* Pass against core.feature in its new form, both with the Cucumber-ruby/Aruba pair and cucumber-js itself (Julien Biezemans)
* Refactor cucumber-features JS mappings (Julien Biezemans)
* Refactor js-specific features (Julien Biezemans)
* Rename PyString to DocString ([#15](https://github.com/cucumber/cucumber-js/issues/15), Julien Biezemans)
* Update Gherkin to 2.4.0 (Julien Biezemans)
* Modularize the project and use browserify.js to serve a single JS file to browsers. ([#3](https://github.com/cucumber/cucumber-js/issues/3), Julien Biezemans)
* Rename Cucumber.Types to Cucumber.Type (Julien Biezemans)
* Use progress formatter in cucumber-features ([#17](https://github.com/cucumber/cucumber-js/issues/17), Julien Biezemans)



## [v0.0.x](https://github.com/cucumber/cucumber-js/compare/v0.0.1...v0.1.0^)

### [v0.0.1](https://github.com/cucumber/cucumber-js/tree/v0.0.1)

* Emerge Cucumber.js with bare support for features, scenarios and steps. It does not handle several Gherkin elements nor failures yet. (Julien Biezemans)

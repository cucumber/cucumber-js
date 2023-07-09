# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) on how to contribute to Cucumber.

## [Unreleased]
### Added
- Support attachments with filenames ([#2297](https://github.com/cucumber/cucumber-js/pull/2297))

## [9.2.0] - 2023-06-22
### Added
- New option for JUnit test suite name to be passed in `formatOptions` ([#2265](https://github.com/cucumber/cucumber-js/issues/2265))
- Include source reference in emitted messages for parameter types ([#2287](https://github.com/cucumber/cucumber-js/pull/2287))

### Fixed
- Correctly interpret retried scenarios in rerun formatter ([#2292](https://github.com/cucumber/cucumber-js/pull/2292))

## [9.1.2] - 2023-05-07
### Changed
- Only show global install warning in debug mode ([#2285](https://github.com/cucumber/cucumber-js/pull/2285))

### Fixed
- Export `ISupportCodeLibrary` type on `/api` entry point ([#2284](https://github.com/cucumber/cucumber-js/pull/2284))

## [9.1.1] - 2023-05-02
### Fixed
- Upgrade `yaml` to address security vulnerability ([#2281](https://github.com/cucumber/cucumber-js/pull/2281))

## [9.1.0] - 2023-03-28
### Added
- Formatters create sub-directory automatically instead of failing ([#2266](https://github.com/cucumber/cucumber-js/pull/2266))
- Include a less cryptic error message when trying to `require` an ES module ([#2264](https://github.com/cucumber/cucumber-js/pull/2264))

### Changed
- Change hashes type from `any` to `Record<string, string>` in `DataTable` ([#2270](https://github.com/cucumber/cucumber-js/pull/2270))

## [9.0.1] - 2023-03-15
### Fixed
- Ensure feature paths are properly deduplicated ([#2258](https://github.com/cucumber/cucumber-js/pull/2258))

## [9.0.0] - 2023-02-27
### Removed
- BREAKING CHANGE: Remove support for Node.js versions 12 and 17 ([#2237](https://github.com/cucumber/cucumber-js/pull/2237))
- BREAKING CHANGE: Remove "generator" snippet interface ([#2241](https://github.com/cucumber/cucumber-js/pull/2241))

## [8.11.1] - 2023-02-12
### Fixed
- Exit correctly when there's a Gherkin parse failure [#2233](https://github.com/cucumber/cucumber-js/pull/2233)
- Refer to correct example line in JSON formatter ([#2236](https://github.com/cucumber/cucumber-js/pull/2236))
- Expose correct overload types for `this.attach` function ([#2238](https://github.com/cucumber/cucumber-js/pull/2238))

## [8.11.0] - 2023-02-10
### Added
- Affirm support for Node.js 19 [#2230](https://github.com/cucumber/cucumber-js/pull/2230)
- Include some exception details in the result of a test step for downstream tools [#2229](https://github.com/cucumber/cucumber-js/pull/2229)

### Fixed
- Handle invalid characters when generating XML for JUnit formatter [#2228](https://github.com/cucumber/cucumber-js/pull/2228)

## [8.10.0] - 2022-12-27
### Added
- Add support for YAML as a configuration file format ([#2199](https://github.com/cucumber/cucumber-js/pull/2199))

### Changed
- Replace `duration` with `luxon` for formatting durations ([#2204](https://github.com/cucumber/cucumber-js/pull/2204))

## [8.9.1] - 2022-12-16
### Fixed
- Include original coordinates in `loadSupport` result ([#2197](https://github.com/cucumber/cucumber-js/pull/2197))

## [8.9.0] - 2022-11-24
### Added
- Add new JUnit formatter (see [documentation](./docs/formatters.md#junit)) ([#2121](https://github.com/cucumber/cucumber-js/pull/2121))

## [8.8.0] - 2022-11-14
### Changed
- Add `workerId` property to `testCaseStarted` message ([#2085](https://github.com/cucumber/cucumber-js/pull/2085))
- Handle stack traces without V8-specific modification ([#2119](https://github.com/cucumber/cucumber-js/pull/2119))

## [8.7.0] - 2022-10-17
### Deprecated
- `Cli`, `PickleFilter` and `Runtime` deprecated in favour of new API functions (see [documentation](./docs/deprecations.md)) ([#2136](https://github.com/cucumber/cucumber-js/pull/2136))

## [8.6.0] - 2022-09-20
### Added
- Debug logging capability to help diagnose configuration issues (see [documentation](./docs/debugging.md)) ([#2120](https://github.com/cucumber/cucumber-js/pull/2120))

### Fixed
- Rework time interfaces to avoid using sinon types ([#2142](https://github.com/cucumber/cucumber-js/pull/2142))

## [8.5.3] - 2022-09-10
### Fixed
- Default `stderr` if not provided to `Cli` constructor ([#2138](https://github.com/cucumber/cucumber-js/pull/2138))

## [8.5.2] - 2022-08-24
### Added
- `IMethods` interface for use in `getTimestamp`, `durationBetweenTimestamps`, and `wrapPromiseWithTimeout` functions and `methods` in `time` module instead of explicit `any` ([#2111](https://github.com/cucumber/cucumber-js/pull/2111))
- `IPublishConfig` interface for use in return type of `makePublishConfig` instead of explicit `any` ([#2106](https://github.com/cucumber/cucumber-js/pull/2106))

### Fixed
- Add override to ensure `ansi-regex` version is `^5.0.1` ([#2114](https://github.com/cucumber/cucumber-js/pull/2114))

## [8.5.1] - 2022-07-28
### Fixed
- Ensure durations are integers in JSON formatter ([#2094](https://github.com/cucumber/cucumber-js/pull/2094))

## [8.5.0] - 2022-07-19
### Changed
- Reworked handling for invalid installations ([#2089](https://github.com/cucumber/cucumber-js/pull/2089))

## [8.4.0] - 2022-06-29
### Fixed
- Fix issues with using absolute paths for features ([#2063](https://github.com/cucumber/cucumber-js/pull/2063))

## [8.3.1] - 2022-06-21
### Fixed
- Export `IConfiguration` type on API entry point ([#2064](https://github.com/cucumber/cucumber-js/pull/2064))

## [8.3.0] - 2022-06-11
### Added
- Add `willBeRetried` to the parameter passed to `After` hook functions ([#2045](https://github.com/cucumber/cucumber-js/pull/2045))

### Changed
- `defineStep` is now deprecated and will eventually be removed; use the appropriate Given/When/Then keyword to define your step ([#2044](https://github.com/cucumber/cucumber-js/pull/2044))

### Fixed
- Prevent outputting ANSI escapes to `stderr` if it can't display them ([#2035](https://github.com/cucumber/cucumber-js/pull/2035))

## [8.2.2] - 2022-05-27
### Changed
- Use latest HTML formatter with better handling for scenario outlines

## [8.2.1] - 2022-05-14
### Fixed
- Fix return type of step hook function to allow async functions ([#2038](https://github.com/cucumber/cucumber-js/pull/2038))

## [8.2.0] - 2022-05-05
### Changed
- Fix issues with colored output, support `FORCE_COLOR` environment variable as an override ([#2026](https://github.com/cucumber/cucumber-js/pull/2026))

## [8.1.2] - 2022-04-22
### Added
- Explicit support for Node.js 18 ([#2007](https://github.com/cucumber/cucumber-js/pull/2007))

### Fixed
- Re-add `cucumber-js` bin file for backwards compatibility ([#2008](https://github.com/cucumber/cucumber-js/pull/2008))

## [8.1.1] - 2022-04-20
### Fixed
- Capture dependency on `@cucumber/message-streams` to satisfy peer requirement from `@cucumber/gherkin-streams` ([#2006](https://github.com/cucumber/cucumber-js/pull/2006))

## [8.1.0] - 2022-04-20
### Added
- Add support for named hooks (see [documentation](./docs/support_files/hooks.md#named-hooks)) ([#1994](https://github.com/cucumber/cucumber-js/pull/1994))
- Add generics support for world parameters type in world-related interfaces and classes (see [documentation](./docs/support_files/world.md#typescript)) ([#1968](https://github.com/cucumber/cucumber-js/issues/1968) [#2002](https://github.com/cucumber/cucumber-js/pull/2002))

### Changed
- Rename the `cucumber-js` binary's underlying file to be `cucumber.js`, so it doesn't fall foul of Node.js module conventions and plays nicely with ESM loaders (see [documentation](./docs/esm.md#transpiling)) ([#1993](https://github.com/cucumber/cucumber-js/pull/1993))

### Fixed
- Correctly escape backslashes in generated expressions for snippets ([#1324](https://github.com/cucumber/cucumber-js/issues/1324) [#1995](https://github.com/cucumber/cucumber-js/pull/1995))

## [8.0.0] - 2022-04-06
### Changed
- Emit a warning when using a Node.js version that's untested with Cucumber ([#1959](https://github.com/cucumber/cucumber-js/pull/1959))

### Fixed
- Allow `file://` URLs to be used as formatter/snippet paths in options ([#1963](https://github.com/cucumber/cucumber-js/pull/1963) [#1920](https://github.com/cucumber/cucumber-js/issues/1920))
- Allow custom formatters to rely on `--require-module` transpilers ([#1985](https://github.com/cucumber/cucumber-js/pull/1985))

## [8.0.0-rc.3] - 2022-03-21
### Added
- Add support for Node.js 17
- Cucumber Expressions now support a wider array of parameter types (see [documentation](https://github.com/cucumber/cucumber-expressions#parameter-types))
- Improved styling and usability on report from `html` formatter
- Support for customising work assignment when running in parallel (see [documentation](./docs/parallel.md#custom-work-assignment)) ([#1044](https://github.com/cucumber/cucumber-js/issues/1044) [#1588](https://github.com/cucumber/cucumber-js/pull/1588))
- Add a new option to `--format-options`: `printAttachments` (see [documentation](./docs/formatters.md#options)) ([#1136](https://github.com/cucumber/cucumber-js/issues/1136) [#1721](https://github.com/cucumber/cucumber-js/pull/1721))
- Support for configuration to be objects instead of argv strings, and for configuration files in ESM and JSON formats (see [documentation](./docs/configuration.md#files)) ([#1952](https://github.com/cucumber/cucumber-js/pull/1952))
- New API for running Cucumber programmatically (see [documentation](./docs/javascript_api.md)) ([#1955](https://github.com/cucumber/cucumber-js/pull/1955))

### Changed
- Switch from `colors` to `chalk` for terminal coloring ([#1895](https://github.com/cucumber/cucumber-js/pull/1895))

### Deprecated
- `parseGherkinMessageStream` is deprecated in favour of `loadSources` ([#1957](https://github.com/cucumber/cucumber-js/pull/1957))

### Fixed
- Warn users who are on an unsupported Node.js version ([#1922](https://github.com/cucumber/cucumber-js/pull/1922))
- Allow formatters to finish when a Gherkin parse error is encountered ([#1404](https://github.com/cucumber/cucumber-js/issues/1404) [#1951](https://github.com/cucumber/cucumber-js/pull/1951))

### Removed
- `getConfiguration`, `initializeFormatters` and `getSupportCodeLibrary` methods removed from `Cli` class in favour of [new API](./docs/javascript_api.md)

## [8.0.0-rc.2] - 2022-01-10
### Added
- Export Cucumber's version number. It is now possible to retrieve the current version of Cucumber using `import { version } from '@cucumber/cucumber'` ([#1866](https://github.com/cucumber/cucumber-js/pull/1866) [#1853](https://github.com/cucumber/cucumber-js/issues/1853))

### Changed
- Switched to new `@cucumber/ci-environment` library for CI detection ([#1868](https://github.com/cucumber/cucumber-js/pull/1868))

### Fixed
- Handles spaces in paths for developers working on Cucumber's own code ([#1845](https://github.com/cucumber/cucumber-js/issues/1845))
- Ensure `package.json` can be imported by consuming projects ([#1870](https://github.com/cucumber/cucumber-js/pull/1870) [#1869](https://github.com/cucumber/cucumber-js/issues/1869))
- Allows for parentheses in paths for developers working on Cucumber's own code ([#1735](https://github.com/cucumber/cucumber-js/issues/1735))
- Smoother onboarding for Windows developers ([#1863](https://github.com/cucumber/cucumber-js/pull/1863))
- Pin `colors` to `1.4.0` to fix security vulnerability ([#1884](https://github.com/cucumber/cucumber-js/issues/1884))
- Pin `cli-table3` to `0.6.1` to fix security vulnerability ([#251](https://github.com/cli-table/cli-table3/pull/251))

## [8.0.0-rc.1] - 2021-10-19
### Added
- Add `wrapPromiseWithTimeout` to public API ([#1566](https://github.com/cucumber/cucumber-js/pull/1566))
- Add support for user code as native ES modules
- `BeforeStep` and `AfterStep` hook functions now have access to the `pickleStep` in their argument object
- `--config` option to the CLI. It allows you to specify a configuration file other than `cucumber.js` (see [documentation](./docs/profiles.md#using-another-file-than-cucumberjs)) [#1794](https://github.com/cucumber/cucumber-js/pull/1794)

### Changed
- Relative paths for custom snippet syntaxes must begin with `.` ([#1640](https://github.com/cucumber/cucumber-js/issues/1640))
- Absolute paths for custom formatters and snippet syntaxes must be a valid `file://` URL
- Use performance timers for test case duration measurement [#1793](https://github.com/cucumber/cucumber-js/pull/1793)

### Fixed
- Allow targeting same file multiple times ([#1708](https://github.com/cucumber/cucumber-js/pull/1708))
- When running with `--dry-run`, undefined or ambiguous steps no longer cause the process to exit with code 1 ([#1814](https://github.com/cucumber/cucumber-js/pull/1814))
- When running the `--help` command, it now shows all available formatters under the `--format` option [#1798](https://github.com/cucumber/cucumber-js/pull/1798)

### Removed
- Drop support for Node.js 10 and 15, add support for Node.js 16
- Remove deprecated `--retryTagFilter` option (the correct option is `--retry-tag-filter`) ([#1713](https://github.com/cucumber/cucumber-js/pull/1713))
- Remove validation that step definition functions are not generators
- Remove `--predictable-ids` option (was only used for internal testing)

## [7.3.2] - 2022-01-10
### Fixed
- Pin `colors` to `1.4.0` to fix security vulnerability ([#1884](https://github.com/cucumber/cucumber-js/issues/1884))
- Pin `cli-table3` to `0.6.1` to fix security vulnerability ([#251](https://github.com/cli-table/cli-table3/pull/251))

## [7.3.1] - 2021-07-20
### Deprecated
- Deprecate `setDefinitionFunctionWrapper` and step definition option `wrapperOptions`

### Fixed
- Prevent duplicate scenario execution where the same feature is targeted in multiple line expressions ([#1706](https://github.com/cucumber/cucumber-js/issues/1706))
- Fixed reports banner to point to [new docs](https://cucumber.io/docs/cucumber/environment-variables/) about environment variables
- Re-add color functions for use with custom formatters [1582](https://github.com/cucumber/cucumber-js/issues/1582)
- IParameterTypeDefinition regexp fix [1702](https://github.com/cucumber/cucumber-js/issues/1702)

## [7.3.0] - 2021-06-17
### Added
- Experimental support for [Markdown](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md)
([#1645](https://github.com/cucumber/cucumber-js/pull/1645))

### Changed
- All `testCase` messages now emitted upfront at the start of the run (relevant for formatter authors) ([#1408](https://github.com/cucumber/cucumber-js/issues/1408)
[#1669](https://github.com/cucumber/cucumber-js/pull/1669))
- Clarify that the JSON formatter will not be removed any time soon

### Fixed
- `this` now has correct TypeScript type in support code functions ([#1667](https://github.com/cucumber/cucumber-js/issues/1667) [#1690](https://github.com/cucumber/cucumber-js/pull/1690))
- Progress bar formatter now reports total step count correctly ([#1579](https://github.com/cucumber/cucumber-js/issues/1579)
[#1669](https://github.com/cucumber/cucumber-js/pull/1669))
- Rerun functionality will now run nothing if the rerun file is empty from the previous run ([#1302](https://github.com/cucumber/cucumber-js/issues/1302) [#1568](https://github.com/cucumber/cucumber-js/pull/1568))
- All messages now emitted with project-relative `uri`s
([#1534](https://github.com/cucumber/cucumber-js/issues/1534)
[#1672](https://github.com/cucumber/cucumber-js/pull/1672))
- Json formatter now works with tagged examples
([#1621](https://github.com/cucumber/cucumber-js/issues/1621)
[#1651](https://github.com/cucumber/cucumber-js/pull/1651))

## [7.2.1] - 2021-04-21
### Fixed
- Temporarily remove ESM changes due to impact on formatters

## [7.2.0] - 2021-04-20
### Added
- Experimental support for native ES modules via the [`--esm` flag](./docs/cli.md#es-modules-experimental-nodejs-12) ([#1589](https://github.com/cucumber/cucumber-js/pull/1589))

## [7.1.0] - 2021-04-06
### Added
- Support attachments that are already base64-encoded via a prefix on the MIME type e.g. `this.attach(base64String, 'base64:image/png')` ([#1552](https://github.com/cucumber/cucumber-js/pull/1552))
- Support tagged rules ([cucumber#1123](https://github.com/cucumber/cucumber/issues/1123))

### Fixed
- Fix types for hook functions so they can return e.g. `'skipped'` ([#1542](https://github.com/cucumber/cucumber-js/pull/1542))
- Display the response of the reports server when an error is returned before failing. ([#1608](https://github.com/cucumber/cucumber-js/pull/1608))
- Remove unnecessary implicit dependency on `long` package ([cucumber#1313](https://github.com/cucumber/cucumber/pull/1313))
- Remove unnecessary transitive dependencies on `react` etc ([cucumber#1308](https://github.com/cucumber/cucumber/pull/1308))

## [7.0.0] - 2020-12-21
### Added
- Add a built in `html` formatter for rich HTML reports output as a standalone page ([#1432](https://github.com/cucumber/cucumber-js/pull/1432))
- Add support for `BeforeStep` and `AfterStep` hooks ([#1416](https://github.com/cucumber/cucumber-js/pull/1416))
- Custom formatters can now be resolved by a module name (as well as by a relative path), enabling use of Yarn PnP ([#1413](https://github.com/cucumber/cucumber-js/pull/1413))

### Fixed
- Wrong version in meta message [#1439](https://github.com/cucumber/cucumber-js/issues/1439) [#1442](https://github.com/cucumber/cucumber-js/pull/1442)

### Removed
- Support for running Cucumber in web browsers has been removed ([#1508](https://github.com/cucumber/cucumber-js/pull/1508)). This feature was increasingly difficult to support and seldom used. Node.js will now be the only support runtime for Cucumber itself; of course as before you can still use tools like WebDriver and Puppeteer to instrument testing of browser-based software. See [the discussion in #1437](https://github.com/cucumber/cucumber-js/issues/1437) for more about why this change is happening.

## [7.0.0-rc.0] - 2020-09-14
### Added
- Add `--publish` option to publish reports to [reports.cucumber.io](https://reports.cucumber.io) [#1423](https://github.com/cucumber/cucumber-js/issues/1423), [#1424](https://github.com/cucumber/cucumber-js/pull/1424)
- Add support for Gherkin's [Rule/Example syntax](https://cucumber.io/docs/gherkin/reference/#rule)
- Add `transpose` method to [data table interface](docs/support_files/data_table_interface.md)
- Add `log` function to world, providing a shorthand to log plain text as [attachment(s)](docs/support_files/attachments.md)
- Now includes [TypeScript](https://www.typescriptlang.org/) type definitions, deprecating the need for `@types/cucumber` in TypeScript projects

### Changed
- The npm module has changed name from `cucumber` to `@cucumber/cucumber` -  `require`/`import` statements must be changed from `cucumber` to `@cucumber/cucumber`
- TypeScript users must rename `TableDefinition` to `DataTable`
- Drop support for Node.js 8, add support for Node.js 14
- Events are now based on [cucumber-messages](https://github.com/cucumber/messages)
- `event-protocol` formatter has been removed and replaced with `message`
- Formatters
- Remove long-deprecated `typeName` from options object for `defineParameterType` in favour of `name`
- `CUCUMBER_TOTAL_SLAVES` is now `CUCUMBER_TOTAL_WORKERS`
- `CUCUMBER_SLAVE_ID` is now `CUCUMBER_WORKER_ID`
- Parallel runtime environment variables renamed for inclusivity:
- Custom formatters are now loaded via the regular require paths relative to the current directory, unless it begins with a dot (e.g. `--format=./relpath/to/formatter`). Previously this was always loaded as a file relative to the current directory.

### Deprecated
- `json` formatter is deprecated and will be removed in next major release. Custom formatters should migrate to use the `message` formatter, or the [standalone JSON formatter](https://github.com/cucumber/json-formatter) as a stopgap.

### Fixed
- don't execute BeforeAll and AfterAll hooks when in dry-run
- support correct case for `--retry-tag-filter` CLI argument

## [6.0.5] - 2019-11-13
### Fixed
- json formatter: fix duration to be nanoseconds (was femtoseconds)

## [6.0.4] - 2019-11-10
### Fixed
- retry: create a new World instance for every attempt

## [6.0.3] - 2019-10-27
### Fixed
- Revert JSON formatter changes to be backward compatible

## [6.0.2] - 2019-10-07
### Fixed
- Upgrade to cucumber-expressions 8.0.1 to fix failure on multiple installs

## [6.0.1] - 2019-10-06
### Fixed
- Release to fix missing lib

## [6.0.0] - 2019-10-06
### Added
- Use `--retry <NUMBER>` and limit what tests will be retried with `--retryTagFilter <EXPRESSION>`
- Event-protocol added an `attemptNumber` to test case started, test case finished, and all test step events and a `retried` boolean to the test case result to signify if the test case was retried
- Add ability to retry flaky tests
- usage-json formatter: add code and patternType
- Add support for Node.js 12

### Changed
- Drop support for Node.js 6
- JSON formatter has major Changed. View some sample outputs [here](/features/fixtures/formatters/). The `*.json.js` files contain the js objects the json parses to. (UPDATE - reverted in 6.0.3)
- Duration is now in nanoseconds in event-protocol formatter and in events sent to custom formatters
- Custom formatters: Formatter helpers and EventDataCollector had Changed to support retry

### Fixed
- Prevent after hooks from updating skipped scenarios to passed
- Parallel: beforeAll / afterAll errors fail the suite
- Fix CLI help link

## [5.1.0] - 2018-12-28
### Fixed
- Upgrade to babel 7

## [5.0.3] - 2018-12-03
### Fixed
- Only create Cucumber Expressions once

## [5.0.2] - 2018-10-06
### Fixed
- Update default of formatters' colors enabled to be true only if the stream is a TTY
- Allow writing to stdout when running in parallel
- Skip other before hooks if one returns skipped

## [5.0.1]
### Fixed
- Update dependencies to avoid licensing problems

## [5.0.0] - 2018-04-09
### Added
- Add support for Node.js 10

### Changed
- Drop support for Node.js 4

### Fixed
- Update dependencies to avoid licensing problems
- Provide better error message when trying to attach data after the scenario has finished. This is possible if not waiting for the attach to finish.

## [4.2.1] - 2018-04-09
### Fixed
- improve the error message for gherkin parse errors

## 4.2.0 - 2018-04-03
### Added
- add cli option `--order <TYPE[:SEED]>` to run scenarios in the specified order. Type should be `defined` or `random`

## [4.1.0] - 2018-03-27
### Added
- update step timeout error message for each interface ([#1028](https://github.com/cucumber/cucumber-js/pull/1028), Bruce Lindsay)
- default to synchronous snippets
- print text step attachments ([#1041](https://github.com/cucumber/cucumber-js/pull/1041), DevSide)

### Fixed
- cucumber-expressions: Upgrade from 5.0.7 to [5.0.13](https://github.com/cucumber/cucumber-expressions/blob/main/CHANGELOG.md#5013---2018-01-21)
- fix error serialization in parallel mode

## [4.0.0] - 2018-01-24
### Added
- can now use glob patterns for selecting what features to run
- update `--require` to support glob patterns
- add `--require-module <NODE_MODULE>` to require node modules before support code is loaded
- add snippet interface "async-await"
- add `--parallel <NUMBER_OF_SLAVES>` option to run tests in parallel. Note this is an experimental feature. See [here](/docs/cli.md#parallel-experimental) for more information

### Changed
- cucumber now waits for the event loop to drain before exiting. To exit immediately when the tests finish running use `--exit`. Use of this flag is discouraged. See [here](/docs/cli.md#exiting) for more information
- remove `--compiler` option. See [here](/docs/cli.md#transpilers) for the new way to use transpilers
- remove binaries `cucumber.js` and `cucumberjs`. Use `cucumber-js`

### Deprecated
- `defineSupportCode` is deprecated. Require/import the individual methods instead

### Fixed
- revert json formatter duration to nanoseconds

## [3.2.1] - 2018-01-03
### Fixed
- revert json formatter mime type ([#995](https://github.com/cucumber/cucumber-js/pull/995)

## [3.2.0] - 2017-12-08
### Added
- add exception to `test-case-finished` event ([#952](https://github.com/cucumber/cucumber-js/pull/952) Giuseppe DiBella)
- compiler option - allow `:` in module name to support specifying an absolute path on Windows ([#958](https://github.com/cucumber/cucumber-js/pull/958) Darrin Holst)
- json formatter: format step result exception ([#973](https://github.com/cucumber/cucumber-js/pull/973) Valerio Innocenti Sedili)

### Fixed
- cucumber-expressions: Upgrade from 5.0.3 to [5.0.6](https://github.com/cucumber/cucumber-expressions/blob/main/CHANGELOG.md#506---2017-11-28)
- tag-expressions: Upgrade from 1.0.1 to [1.1.1](https://github.com/cucumber/tag-expressions/blob/main/CHANGELOG.md#111---2017-12-01)

## [3.1.0] - 2017-10-25
### Added
- add `--language` cli option to provide the default language for feature files

### Fixed
- pickle filter: support relative paths ([#962](https://github.com/cucumber/cucumber-js/pull/962) Marco Muller)

## [3.0.6] - 2017-10-18
### Fixed
- cli: fix `--format` option parsing on Windows ([#954](https://github.com/cucumber/cucumber-js/pull/954) Darrin Holst)

## [3.0.5] - 2017-10-14
### Added
- `defineParameterType`: The `transformer` function's `this` object is now the current World (as long as it's not an arrow function). ([#948](https://github.com/cucumber/cucumber-js/pull/948) Aslak Hellesøy)
- `Before` / `After`: The first argument now includes a `pickle` property which can
be used to get the name / tags of the running scenario. ([#947](https://github.com/cucumber/cucumber-js/pull/947) Giuseppe DiBella)

## [3.0.4] - 2017-10-04
### Added
- cli: make `--tags` option repeatable (joined with `and`) ([#940](https://github.com/cucumber/cucumber-js/issues/940), Ilya Kozhevnikov)
- rerun formatter: make separator configurable. See docs [here](https://github.com/cucumber/cucumber-js/blob/fb9e8fc2e68d4395b9b0a124d18e036d00a8c69f/docs/cli.md) ([#930](https://github.com/cucumber/cucumber-js/issues/930), Máté Karácsony)

## [3.0.3] - 2017-09-23
### Added
- support to imperatively skip steps. See documentation [here](/docs/support_files/step_definitions.md#skipped-steps) ([#912](https://github.com/cucumber/cucumber-js/issues/912), jshifflet)

## [3.0.2] - 2017-09-13
### Added
- `defineParameterType`: new options `useForSnippets` and `preferForRegexpMatch`. Please see documentation for usage.

### Deprecated
- `defineParameterType`: `typeName` option is deprecated in favor of `name`

### Fixed
- fix `usage` and `usage-json` formatters when there are undefined steps

## [3.0.1] - 2017-08-28
### Fixed
- JSON formatter: add type to scenario ([#893](https://github.com/cucumber/cucumber-js/issues/893), szymonprz)
- BeforeAll/AfterAll hooks: fix timeout support ([#899](https://github.com/cucumber/cucumber-js/issues/899))
- format output paths: allow absolute paths ([#906](https://github.com/cucumber/cucumber-js/issues/906), Darrin Holst)
- Before/After: fix undefined hook parameter ([#919](https://github.com/cucumber/cucumber-js/issues/919))
- update nodejs example
([#898](https://github.com/cucumber/cucumber-js/issues/898), João Guilherme Farias Duda)
- fix typo and make punctuation consistent
([#909](https://github.com/cucumber/cucumber-js/issues/909), Dmitry Shirokov)
- normalize CHANGELOG
([#915](https://github.com/cucumber/cucumber-js/issues/915), Jayson Smith)

## [3.0.0] - 2017-08-08
### Added
- Add `--i18n-languages` and `--i18n-keywords <ISO 639-1>` CLI options
- Add `BeforeAll` / `AfterAll` hooks for suite level setup / teardown
- Add event protocol formatter
- Add built in `{word}` parameter type which is equivalent to `[A-Za-z0-9_]+`
- Allow multiple parameter types to use the same regular expression
- `cucumber-expressions`:
- Improve error message when using multiple asynchronous interfaces

### Changed
- `pretty` formatter has been removed. All errors are now reported in a `pretty` format instead. The `progress` formatter is now the default.
- Major changes to [custom formatter](/docs/custom_formatters.md) and [custom snippet syntax](/docs/custom_snippet_syntaxes.md) APIs due to rewrite in support of the event protocol. Please see the updated documentation.
- Remove `registerHandler` and `registerListener`. Use `BeforeAll` / `AfterAll` for setup  code. Use the event protocol formatter if used for reporting. Please open an issue if you have another use case.
- Remove deprecated `addTransform`. Use `defineParameterType` instead.
- using an undefined parameter type now results in an error
- `{stringInDoubleQuotes}` is now `{string}` which works for strings in single or double quotes
- `cucumber-expressions`:
- Undefined steps fail the build in non-strict mode. Non-strict mode only allows pending steps now.

### Fixed
- Fix support code line and uri references when using direct imports

## [2.3.1] - 2017-06-09
### Added
- pass step specific options to definition function wrapper ([#838](https://github.com/cucumber/cucumber-js/issues/838), Łukasz Gandecki)

## [2.3.0] - 2017-06-01
### Added
- Add support code aliases for every method in the [support code API](./docs/support_files/api_reference.md).

## [2.2.0] - 2017-05-20
### Added
- Add `progress-bar` formatter inspired by [fuubar-cucumber](https://github.com/martinciu/fuubar-cucumber) and [fuubar](https://github.com/thekompanee/fuubar) which outputs a progress bar and errors as they happen

## [2.1.0] - 2017-05-12
### Fixed
- throw descriptive error message when running a global install

## [1.3.3] - 2016-04-26
### Fixed
- fix unhandled rejections in handlers ([#792](https://github.com/cucumber/cucumber-js/issues/792), yaronassa)

## [1.3.2] - 2016-03-20
### Fixed
- dependency: fix use of gherkin to not rely on removed field

## [2.0.0-rc.9] - 2017-03-16
### Fixed
- dependency: fix use of gherkin to not rely on removed field

## [2.0.0-rc.8] - 2017-03-10
### Added
- all async parameter type transform functions (Aslak Hellesøy)
- make all formatters available when requiring

### Deprecated
- `addTransform` was deprecated in favor of `defineParameterType`

### Fixed
- generated step definition snippets are not found ([#732](https://github.com/cucumber/cucumber-js/issues/732), Aslak Hellesøy)
- catch attempt to define duplicate parameter type regular expression ([#780](https://github.com/cucumber/cucumber-js/issues/780), Aslak Hellesøy)
- catch errors in parameter type transform functions (Aslak Hellesøy)
- normalize syntax highlighting ([#726](https://github.com/cucumber/cucumber-js/issues/726), Martin Delille)
- fix setWorldConstructor example

## [2.0.0-rc.7] - 2017-01-30
### Fixed
- fix after hook run order ([#743](https://github.com/cucumber/cucumber-js/issues/743))
- normalize syntax highlighting ([#726](https://github.com/cucumber/cucumber-js/issues/726), (Martin Delille)
- fix addTransform parameter name ([#738](https://github.com/cucumber/cucumber-js/issues/738))

## [2.0.0-rc.6] - 2017-01-06
### Added
- usage and usage-json formatters
- update error reporting for `registerHandler` errors
- add ability to disable timeout

### Fixed
- update snippets to new support code interface

## [2.0.0-rc.5] - 2016-12-22
### Changed
- Drop support for Node 0.12
- format assertion errors to display diffs

### Fixed
- fix CLI format-options name ([#703](https://github.com/cucumber/cucumber-js/issues/703), Florian Ribon)
- add link on README.md to custom formatters documentation

## [2.0.0-rc.4] - 2016-12-19
### Changed
- update support code library interface - instead of exporting a function and calling methods on `this`, require the `cucumber` module and call `defineSupportCode` which passes an object as the first argument whch exposes the methods. Overriding the world constructor has changed from overriding the World property to calling `setWorldConstructor`.

## [2.0.0-rc.3] - 2016-12-19
### Added
- validate argument types

### Changed
- make strict the default
- previously pending and undefined steps did not cause an exit code of 1. This could be overridden with `--strict`. Strict is now the default and you can use `--no-strict` to return to the previous behavior.
- update automatically required files
- if the features live in a `features` directory at any level, all support files in the `features` directory are loaded.

### Fixed
- prevent crash on empty feature file
- docs: fix tag expression migration guide ([#691](https://github.com/cucumber/cucumber-js/issues/691), Aslak Hellesøy)

## [2.0.0-rc.2] - 2016-12-04
### Added
- json formatter: add `isBackground` to steps

### Changed
- pass `attach` to world constructor instead of assigning it to world
- the world constructor now receives `{attach, parameters}` as the first argument instead of `parameters`

### Fixed
- clear timeouts of asynchronous hooks/steps
- stop running features with no scenarios
- update node js example

## [2.0.0-rc.1] - 2016-11-25
### Fixed
- fix browser version

## [2.0.0-rc.0] - 2016-11-25
### Added
- Attachments:
- When attaching a stream, the interface can either accept a callback as a third argument or will return a promise if not passed a callback
- Step Definitions
- Ability to add custom argument transformations
- Support Files
- When used together rerun formatter will output all skipped scenarios that didn't run due to a failure
- Fail fast / rerun formatter

### Changed
- Dropped support for Node 0.10
- `--colors / --no-colors` has moved to `--format-options '{"colorsEnabled": <BOOLEAN>}'`
- `--require <DIR|FILE>`: the required files are no longer reordered to require anything in a `support` directory first
- `--snippet-interface <INTERFACE>` has moved to `--format-options '{"snippetInterface": "<INTERFACE>"}'`
- `--snippet-syntax <SYNTAX>` has moved to `--format-options '{"snippetSyntax": "<SYNTAX>"}'`
- `--tags <EXPRESSION>` now uses [cucumber-tag-expressions](https://github.com/cucumber/tag-expressions). It is no longer repeatable and new values will override previous
- `--tags @dev` stays the same
- `--tags ~@dev` becomes `--tags 'not @dev'`
- `--tags @foo,@bar` becomes  `--tags '@foo or @bar'`
- `--tags @foo --tags @bar` becomes `--tags '@foo and @bar'`
- CLI
- complete rewrite using ES2015 and promises
- Internals
- String attachments are no longer base64 encoded. Buffer and Stream attachments are still base64 encoded.
- JSON Formatter
- Attachments
- The `attach` function used for adding attachments moved from the API scenario object to world. It is thus now available in step definitions without saving a reference to the scenario.
- When attaching buffers or strings, the callback argument is ignored.
- Hooks
- Hooks now receive a [ScenarioResult](/src/models/scenario_result.js) instead of the Scenario
- The `tags` option for hook should now be a string instead of an array and uses [cucumber-tag-expressions](https://github.com/cucumber/tag-expressions)
- Step Definitions
- String patterns were removed in favor [cucumber-expressions](https://github.com/cucumber/cucumber-expressions)
- capture groups matching `(-?\d+)` will be automatically converted to an integer using `parseInt`
- capture groups matching `(-?\d*\.?\d+)` will be automatically converted to a float using `parseFloat`
- Regular Expressions
- Generator functions are no longer automatically run with `co`. To retain the previous functionality, use [this.setDefinitionFunctionWrapper](/docs/support_files/step_definitions.md#definition-function-wrapper)
- Event Handlers
- For example: `scenario.getName()` is now just `scenario.name`
- Objects no longer have `get*` methods and instead have exposed properties
- `StepResult` duration is now in milliseconds instead of nanoseconds
- Support Files

### Fixed
- remove empty lines from `@rerun` files ([#660](https://github.com/cucumber/cucumber-js/issues/660), Cody Ray Hoeft)
- catch uncaught errors in the browser (Charlie Rudolph)
- fix typo ([#659](https://github.com/cucumber/cucumber-js/issues/659), gforceg)
- update support files api reference ([#661](https://github.com/cucumber/cucumber-js/issues/661), Zearin)

## [1.3.1] - 2016-09-30
### Fixed
- pass formatter options to listener ([#641](https://github.com/cucumber/cucumber-js/issues/641), Charlie Rudolph)
- rerun formatter: output any scenario that doesn't pass (Charlie Rudolph)
- populate scenario definition ([#647](https://github.com/cucumber/cucumber-js/issues/647), Charlie Rudolph)
- handle empty stacktraces ([#605](https://github.com/cucumber/cucumber-js/issues/605), Hugues Malphettes)
- use cross-platform symbols ([#635](https://github.com/cucumber/cucumber-js/issues/635), Kevin Goslar)
- fix node.js example ([#637](https://github.com/cucumber/cucumber-js/issues/637), Jonathan Gomez)
- fix links in event_handlers.md ([#638](https://github.com/cucumber/cucumber-js/issues/638), Oliver Rogers)
- fix hooks example ([#644](https://github.com/cucumber/cucumber-js/issues/644), John McLaughlin)

## [1.3.0] - 2016-09-08
### Added
- add `--snippet-interface <INTERFACE>` CLI option (Charlie Rudolph)
- add `--world-parameters <JSON>` CLI option (Charlie Rudolph)
- add snippets formatter (Charlie Rudolph)
- add support for ES6 default module syntax (dbillingham)
- pretty formatter: add symbols (Charlie Rudolph)
- add simplified hook parameters (Charlie Rudolph)

### Fixed
- step definition snippets internationalization (Charlie Rudolph)
- document order of execution for multiple hooks (John McLaughlin)
- breakup README.md, organize docs (Charlie Rudolph)

## [1.2.2] - 2016-08-05
### Fixed
- Fix error when stack trace has no frames ([#610](https://github.com/cucumber/cucumber-js/issues/610), Jan Molak)

## [1.2.1] - 2016-07-01
### Fixed
- Fix hook / step definition location and stacktraces in the browser ([#567](https://github.com/cucumber/cucumber-js/issues/567), [#538](https://github.com/cucumber/cucumber-js/issues/538), Charlie Rudolph)

## [1.2.0] - 2016-06-24
### Fixed
- Remove intermediate conversion to string (Charlie Rudolph)
- Use native base64 encoding which can encode binary ([#589](https://github.com/cucumber/cucumber-js/issues/589), Benjamín Eidelman)
- Attachments

## [1.1.0] - 2016-06-23
### Added
- Can now use all supported functions interfaces (synchronous, callback, promise, generators)
- Will throw any error received and immediately kill the test suite
- Supports handler specific timeouts
- Updated documentation
- Add full support to `registerHandler` (Charlie Rudolph)

### Fixed
- CLI format: support absolute path on windows (Charlie Rudolph)
- Fix typo in event name. ([#590](https://github.com/cucumber/cucumber-js/issues/590), Artur Pomadowski)
- Don't run hooks in dry run mode (Charlie Rudolph)

## [1.0.0] - 2016-05-30
### Fixed
- Escape all instances of special characters in example / data table  (Charlie Rudolph)

## [0.10.4] - 2016-05-30
### Added
- Allow time to be faked by utilities such as `sinon.useFakeTimers` (John McLaughlin)

## [0.10.3] - 2016-05-19
### Fixed
- Escape newlines in table cells in pretty formatter (Julien Biezemans)
- Fix handling of unusual error objects (efokschaner)

## [0.10.2] - 2016-04-07
### Added
- Add match location to JSON formatter output (Charlie Rudolph)

### Fixed
- Undefined background step (Scott Deakin)

## [0.10.1] - 2016-04-01
### Added
- Support generators for hooks/step definitions (Ádám Gólya)

## [0.10.0] - 2016-04-01
### Added
- support hook specific timeouts (Charlie Rudolph)
- reworked formatter error reporting (Charlie Rudolph)

### Changed
- how to update: use separate before and after hooks. If this is not sufficient, please create an issue.
- removed around hooks (Charlie Rudolph)
- how to update: change `callback.pending()` to `callback(null, 'pending')` or use one of the new pending step interfaces
- updated pending step interface (Charlie Rudolph)
- updated tagged hook interface (Charlie Rudolph)

## [0.9.5] - 2016-02-16
### Added
- Allow rerun file to be in subfolder (Charlie Rudolph)

### Fixed
- Fix rerun formatter output (Charlie Rudolph)

## [0.9.4] - 2016-01-28
### Fixed
- Publish release folder to npm  (Charlie Rudolph)

## [0.9.3] - 2016-01-27
### Added
- Run scenario by name (Charlie Rudolph)

### Fixed
- Prevent maximum call stack from being exceeded (John Krull)
- Add documentation of profiles (Charlie Rudolph)
- README improvements (Miika Hänninen, Kevin Goslar, Maxim Koretskiy)

## [0.9.2]
### Added
- Bump stack-chain (Rick Lee-Morlang)

## [0.9.1]
### Added
- Add rerun formatter (Charlie Rudolph)

### Fixed
- Add ability to execute scenario outline example (Charlie Rudolph)
- Support tags on scenario outline examples (Charlie Rudolph)
- Fix invalid hook documentation (Charlie Rudolph)

## [0.9.0]
### Added
- pretty formatter: source shows step definition location (Charlie Rudolph)
- support node 5 (Charlie Rudolph)

### Changed
- catch ambiguous step definitions (Charlie Rudolph)
- remove use of domain (Charlie Rudolph)

### Fixed
- Fix `Api.Scenario#attach` callback handling (Julien Biezemans)
- Add async example to README (Artem Bronitsky)
- Document hooks sync/async protocols (Julien Biezemans)
- Remove useless callbacks in documentation (Julien Biezemans)
- Fix browser example (Karine Pires)

## [0.8.1]
### Fixed
- Update World constructor documentation (Charlie Rudolph)
- Remove badges from README.md (Charlie Rudolph)

## [0.8.0]
### Added
- Add cli option to fail fast (Charlie Rudolph)
- Add cli for specifying multiple formatters (Charlie Rudolph)
- Add support for passing multiple line numbers (Charlie Rudolph)
- Add ability to disable colors (Charlie Rudolph)
- Add support for custom snippet syntaxes (Charlie Rudolph)

### Changed
- Add strict function length checking to hooks and step definitions (Charlie Rudolph)
- Make World constructors strictly synchronous (Julien Biezemans)
- Hide errors in pretty formatter summary (Charlie Rudolph)
- Remove unnecessary whitespaces in pretty formatter output (Charlie Rudolph)

### Fixed
- Properly ask configurations for strict mode (Julien Biezemans)
- Document data table interface (Charlie Rudolph)
- Refactor: statuses (Charlie Rudolph)
- Refactor: cleanup step definitions (Charlie Rudolph)
- Cleanup: remove log to console from listeners (Charlie Rudolph)
- Use svg badges (Charlie Rudolph)
- Rename CONTRIBUTE.md to CONTRIBUTING.md (Julien Biezemans)
- Require maintainers to document API changes in release tag descriptions (Julien Biezemans)
- Add build-release NPM script (Julien Biezemans)

## [0.7.0]
### Added
- Time out steps that take too long (Charles Rudolph)
- Print execution time (Charles Rudolph)

### Changed
- Remove callback.fail() (Charles Rudolph)
- Update hooks interface (Charles Rudolph)

### Fixed
- Don't try to handle empty features (Julien Biezemans)
- Fix unpredictable nopt behavior (Charles Rudolph)
- Fix pretty formatter step indentation after doc string (Charles Rudolph)
- Rename Collection functions: forEach/syncForEach -> asyncForEach/forEach (Charles Rudolph)
- Simplify installation instructions (Charles Rudolph)
- Fix spec on Windows (Marcel Hoyer)
- Simplify World examples in README (Charles Rudolph)
- Update license in package.json (Charles Rudolph)
- Convert test framework from jasmine-node to jasmine (Charles Rudolph)
- Separate test output (Charles Rudolph)
- Remove ruby, legacy features, cucumber-tck (Charles Rudolph)

## [0.6.0]
### Added
- Add --no-source to hide uris (Eddie Loeffen)
- Add dry run capability (Karthik Viswanath)
- Introduce --compiler CLI option (Charles Rudolph)

### Fixed
- Stop IRC and email notifications from Travis (Julien Biezemans)
- Remove Node.js 0.11 explicit support (Julien Biezemans)
- Use basic for loop for array iterations (Charles Rudolph)
- Bump browserify (Charles Rudolph)
- Add CLI help for --profile (Charles Rudolph)
- Use colors library (Charles Rudolph)
- Improve --compiler help (Julien Biezemans)
- Fix loading of external compiler modules (Julien Biezemans)
- Document a few common compiler usages (Julien Biezemans)

## [0.5.3]
### Added
- Add support for profiles (Charles Rudolph)

### Changed
- Allow for multiple instances of placeholder (Charles Rudolph)
- Print relative paths in summary output (Charles Rudolph)

### Fixed
- Remove duplicate line number from output (Charles Rudolph)
- Return clone of array from DataTable.Row.raw() (Julien Biezemans)
- Update various urls (Dale Gardner)
- Bump CoffeeScript (Julien Biezemans)
- Bump PogoScript (Julien Biezemans)
- Bump underscore (Julien Biezemans)
- Bump underscore.string (Julien Biezemans)
- Bump stack-chain (Julien Biezemans)
- Bump nopt (Julien Biezemans)
- Bump connect (Julien Biezemans)
- Bump exorcist (Julien Biezemans)
- Bump uglifyify (Julien Biezemans)
- Bump through (Julien Biezemans)
- Bump serve-static (Julien Biezemans)
- Bump rimraf (Julien Biezemans)
- Bump mkdirp (Julien Biezemans)
- Bump jshint (Julien Biezemans)
- Remove extra bracket in README example (Julien Biezemans)
- Officially support Node.js 4.x (Julien Biezemans)
- Use a profile for own build (Julien Biezemans)

## [0.5.2]
### Added
- Add rowsHash method to data tables (Mark Amery)

### Fixed
- Remove CLI resource leak timeout (Julien Biezemans)
- Point to cucumber.io instead of cukes.info (Julien Biezemans)
- Fix mixed tabs and spaces (Mark Amery)
- Use hexadecimal values for console colours (Julien Biezemans)
- Update walkdir module to 0.0.10 (Artem Repko)
- Fix ruby tests on Windows (zs-zs)
- Fix npm test to run on Windows (zs-zs)
- Normalize OS-specific path separators in output assertions (zs-zs)
- Relax check for promises in step definitions (zs-zs)
- Add Ast.Feature.getFeatureElements() (Mark Derbecker)
- Add Util.Collection.sort() (Mark Derbecker)
- Add waffle.io badge (Julien Biezemans)

## [0.5.1]
### Added
- Support placeholders in scenario outlines (chrismilleruk)
- Add failure exception to scenario object (Mateusz Derks)

### Fixed
- Fix World example in README (Julien Biezemans)
- Remove moot `version` property from bower.json (Kevin Kirsche)
- Remove obsolete release instruction for bower (Julien Biezemans)
- Add Gitter badge (Julien Biezemans)
- Rephrase spec example (Julien Biezemans)
- Add documentation for attachments (Simon Dean)
- Fix name of Cucumber.Api.Scenario in README (Simon Dean)

## [0.5.0]
### Added
- Support promises from step definitions (Will Farrell)
- Support synchronous step definitions (Julien Biezemans)

### Fixed
- Remove irrelevant feature file (Julien Biezemans)
- Reorganise callback feature (Julien Biezemans)
- Remove unused dependency (Julien Biezemans)
- Document new step definition styles (Julien Biezemans)
- Make step definitions synchronous in example app (Julien Biezemans)

## [0.4.9]
### Added
- Make pretty formatter the default (Julien Biezemans)
- Filter stack traces (close [#157](https://github.com/cucumber/cucumber-js/issues/157), Julien Biezemans)

### Fixed
- Separate source map from bundle (Julien Biezemans)
- Hint (Julien Biezemans)
- Fix misspelling io.js (Sonny Piers)
- Add 0.12 to supported engines in NPM manifest (Julien Biezemans)
- Fix test script to be more portable (Sam Saccone)
- Force Cucumber  for now (Julien Biezemans)
- Bump Cucumber gem to 2.0.0 (Julien Biezemans)
- Explicitly require json module in Ruby stepdefs (Julien Biezemans)
- Add CLI help section for --backtrace (Julien Biezemans)

## [0.4.8]
### Added
- Support IO.js (Sam Saccone)
- Support Node.js 0.12 (Julien Biezemans)

### Fixed
- Handle BOM and fix regexp for hyphenated languages ([#144](https://github.com/cucumber/cucumber-js/issues/144), Aslak Hellesøy)
- Fix attachment clean up in hooks ([#282](https://github.com/cucumber/cucumber-js/issues/282), nebehr)
- More thorough specs for GherkinLexer. Fix build? (Aslak Hellesøy)
- Add jshintrc (Jesse Harlin)
- Hint lib/ (Julien Biezemans)
- Hint bundler and bin (Julien Biezemans)
- Hint spec/ (Julien Biezemans)
- Be consistent in anonymous function syntax (Julien Biezemans)
- Use named functions for all constructors (Julien Biezemans)
- Indent (Julien Biezemans)
- Add more diagnostics to build (Julien Biezemans)
- Remove unnecessary spaces in shell commands (Julien Biezemans)

## [0.4.7]
### Fixed
- Do not dispose of step domains (Julien Biezemans)
- Refactor and add debug code (Julien Biezemans)
- Create a single domain per run (Julien Biezemans)
- Add missing AstTreeWalker specs (Julien Biezemans)
- Indent (Julien Biezemans)
- Spec domain enter/exit in AstTreeWalker (Julien Biezemans)

## [0.4.6]
### Added
- Add --no-snippets flag to CLI (close [#207](https://github.com/cucumber/cucumber-js/issues/207), Krispin Schulz)
- Add strict mode (close [#211](https://github.com/cucumber/cucumber-js/issues/211), Elwyn)
- Add strict mode to volatile configuration (close [#258](https://github.com/cucumber/cucumber-js/issues/258), Jan-Eric Duden)

### Fixed
- Fix code loader on windows (close [#226](https://github.com/cucumber/cucumber-js/issues/226), Gary Taylor)
- Connect to Rubygems through SSL (Julien Biezemans)
- Use Node domain's enter/exit in stepdefs (Julien Biezemans)
- Do not display snippets in build (Julien Biezemans)
- Asynchronously dispose of step domains (Julien Biezemans)
- Change order of tests in build (Julien Biezemans)
- Fix tests to run on Windows (close [#216](https://github.com/cucumber/cucumber-js/issues/216), kostya.misura)
- Fix registerHandler() example in README (Julien Biezemans)
- Fix typo in variable name (Julien Biezemans)
- Fix World property assignment in README example (Julian)
- Unix EOLs (Julien Biezemans)
- Ignore .ruby-* (Julien Biezemans)

## [0.4.5]
### Fixed
- Fix issue with npm upgrade on node.js v0.8 (Simon Dean)
- Use Node domain to handle asynchronous exceptions (Julien Biezemans)

## [0.4.4]
### Fixed
- Allow >1 parameter in string step definitions (Craig Morris)
- Don't skip scenario outlines (close [#245](https://github.com/cucumber/cucumber-js/issues/245), Julien Biezemans)
- Bump nopt (Julien Biezemans)
- Bump coffee-script (Julien Biezemans)
- Bump pogo (Julien Biezemans)
- Bump underscore (Julien Biezemans)
- Bump rimraf (Julien Biezemans)
- Bump jasmine-node (Julien Biezemans)
- Bump connect (Julien Biezemans)
- Rewrite bundling system (close [#186](https://github.com/cucumber/cucumber-js/issues/186), Julien Biezemans)
- Rename release script (Julien Biezemans)
- Upgrade NPM on Travis (Julien Biezemans)
- Drop Node 0.6 support (Julien Biezemans)
- Drop Node 0.6 support (manifest) (Julien Biezemans)

## [0.4.3]
### Fixed
- Scenario outline fixes (Simon Dean)
- Correct the embeddings JSON to match other ports of Cucumber (Simon Dean)

## [0.4.2]
### Added
- Support attachments (close [#189](https://github.com/cucumber/cucumber-js/issues/189), Julien Biezemans)

### Fixed
- Fix world example in main readme (Sam Saccone)
- Update instructings for running tests (Sam Saccone)

## [0.4.1]
### Added
- Target scenario by line number on CLI (close [#168](https://github.com/cucumber/cucumber-js/issues/168), Simon Lampen)

### Fixed
- Ensure no stdout output is lost (Simon Dean)
- Properly tag scenario outlines (close [#195](https://github.com/cucumber/cucumber-js/issues/195), [#197](https://github.com/cucumber/cucumber-js/issues/197), Artur Kania)
- Align snippet comment with Cucumber-Ruby/JVM (close [#150](https://github.com/cucumber/cucumber-js/issues/150), Julien Biezemans)
- Update build badge URL on README (Julien Biezemans)
- Add line number pattern to --help on CLI (Julien Biezemans)
- Document AfterFeatures event (close [#171](https://github.com/cucumber/cucumber-js/issues/171), Eddie Loeffen)
- Include 'features' in *Features events payload (Stanley Shyiko)
- Try to fix build on Travis (Julien Biezemans)
- Remove bower as a dev dependency (close [#191](https://github.com/cucumber/cucumber-js/issues/191), Simon Dean)
- Remove obsolete Travis trick for Node 0.8 (Julien Biezemans)
- Remove development status table from README (Julien Biezemans)
- Help the guy produce changelogs (Julien Biezemans)

## [0.4.0]
### Added
- Add support for scenario outlines and examples (close [#155](https://github.com/cucumber/cucumber-js/issues/155), Ben Van Treese)
- Add i18n support (close [#156](https://github.com/cucumber/cucumber-js/issues/156), Lukas Degener)

### Changed
- Pass scenario to hooks (Marat Dyatko)
- Minor change to stepdef snippets (JS) (Julien Biezemans)
- Make feature id in JSON output replace all spaces (close #[127](https://github.com/cucumber/cucumber-js/issues/127), Tim Perry)
- Bump CoffeeScript (close [#154](https://github.com/cucumber/cucumber-js/issues/154), Gabe Hayes)

### Fixed
- Add Hook spec example for single-arg function (close [#143](https://github.com/cucumber/cucumber-js/issues/143), Julien Biezemans)
- Update README with Hook scenario object doc (Julien Biezemans)
- Style (Julien Biezemans)

## [0.3.3]
### Added
- Output step definition snippets in CoffeeScript (John George Wright)
- Add colors to CLI (Johny Jose)

### Changed
- Add durations to JSON formatter (Simon Dean)

### Fixed
- Bump most dependencies (Julien Biezemans)
- DRY (Julien Biezemans)
- Refactor (Julien Biezemans)

## [0.3.2]
### Added
- Add PogoScript support (Josh Chisholm)
- Add listener and event handler registration (close [#130](https://github.com/cucumber/cucumber-js/issues/130), Paul Shannon)

### Fixed
- Added some nice stats (Aslak Hellesøy)
- Fix spelling of "GitHub" (Peter Suschlik)
- Add Code Climate badge to README (Julien Biezemans)
- Update README.md (Sebastian Schürmann)

## [0.3.1]
### Added
- Add DataTable.rows() (Niklas Närhinen)
- Officially support Node 0.10 and 0.11 (Julien Biezemans)

### Changed
- Update cucumber-html (Aslak Hellesøy)
- Bump Gherkin (Julien Biezemans)
- Add options parameter to JSON formatter (Israël Hallé)
- Updated CoffeeScript (Matteo Collina)
- Specify strict coffee-script version number (Julien Biezemans)
- Bump jasmine-node (Julien Biezemans)

### Fixed
- Fix travis build Node versions (Julien Biezemans)
- Fix Travis CI configuration (Julien Biezemans)
- Remove words in History (Julien Biezemans)
- Update dev status table in README (Julien Biezemans)
- Update LICENSE (Julien Biezemans)
- Add contributors (Julien Biezemans)
- Move data table scenario to TCK (Julien Biezemans)
- Be consistent in spec matchers (Julien Biezemans)
- Remove cucumber.no.de links	(Kim, Jang-hwan)
- Fix broken link in README dev status table ([#118](https://github.com/cucumber/cucumber-js/issues/118), Michael Zedeler)
- Refactor hook-related Given steps in JS stepdefs (Julien Biezemans)
- Refactor failing mapping JS step definitions (Julien Biezemans & Matt Wynne)
- Update README.md to correct error in example for zombie initialization (Tom V)
- Update minor typos in README.md (David Godfrey)

## [0.3.0]
### Added
- Allow for node-like callback errors (Julien Biezemans)
- Accept multiple features in volatile configuration ([#52](https://github.com/cucumber/cucumber-js/issues/52), Julien Biezemans)

### Fixed
- Add ^ prefix and $ suffix to string-based step definition regexps ([#77](https://github.com/cucumber/cucumber-js/issues/77), Julien Biezemans)
- Allow for unsafe regexp characters in stepdef string patterns ([#77](https://github.com/cucumber/cucumber-js/issues/77), Julien Biezemans)
- Build on Node.js 0.8 on Travis (Julien Biezemans)
- Rewrite README's status table in HTML (Julien Biezemans)
- Bump Gherkin ([#78](https://github.com/cucumber/cucumber-js/issues/78), Julien Biezemans)
- Switch to HTML tables in README (Julien Biezemans)
- Bump Aruba (Julien Biezemans)

## [0.2.22]
### Added
- Print data tables and doc strings in pretty formatter output ([#89](https://github.com/cucumber/cucumber-js/issues/89), [#81](https://github.com/cucumber/cucumber-js/issues/81), Julien Biezemans)

### Fixed
- Exclude unmatched features from AST ([#80](https://github.com/cucumber/cucumber-js/issues/80), Julien Biezemans)

## [0.2.21]
### Added
- Add bundler (Julien Biezemans)

## [0.2.20]
### Added
- Add JSON formatter ([#79](https://github.com/cucumber/cucumber-js/issues/79), Chris Young)

### Fixed
- Fix data table and tags handling in JSON formatter (Julien Biezemans)
- Force example feature execution order in JSON feature (Julien Biezemans)

## [0.2.19]
### Fixed
- Fix CLI arguments passing ([#83](https://github.com/cucumber/cucumber-js/issues/83), Omar Gonzalez)
- Refactor "summarizer" listener to summary formatter ([#71](https://github.com/cucumber/cucumber-js/issues/71), 28b74ef, Julien Biezemans)
- Add "summary" formatter to available CLI formatters (Julien Biezemans)
- Fix spec example description (Julien Biezemans)

## [0.2.18]
### Fixed
- Replace findit with walkdir to fix file loading on Windows ([#73](https://github.com/cucumber/cucumber-js/issues/73), Aaron Garvey)
- Rename spec file (Julien Biezemans)
- Extract developer documentation from README to CONTRIBUTE (Julien Biezemans)
- Bump browserify (Julien Biezemans)
- Update supported Node.js versions (Julien Biezemans)

## [0.2.17]
### Added
- Add pretty formatter (simplified, monochrome) ([#59](https://github.com/cucumber/cucumber-js/issues/59), @renier, Julien Biezemans)

### Fixed
- Display only master branch build status in README (Julien Biezemans)
- Rename "summary logger" to "summarizer" ([#59](https://github.com/cucumber/cucumber-js/issues/59), Julien Biezemans)
- Extract common formatter methods ([#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)

## [0.2.16]
### Added
- Display failing scenario URIs in summary (Julien Biezemans)

### Fixed
- Ran a gem update (Aslak Hellesøy)
- Update NPM dependencies ([#69](https://github.com/cucumber/cucumber-js/issues/69), Aslak Hellesøy)
- Refactor listener infrastructure ([#35](https://github.com/cucumber/cucumber-js/issues/35), [#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)
- Extract summary logger from progress formatter ([#59](https://github.com/cucumber/cucumber-js/issues/59), [#63](https://github.com/cucumber/cucumber-js/issues/63), Julien Biezemans)
- Store URI on AST elements (Julien Biezemans)

## [0.2.15]
### Added
- Handle asynchronous exceptions ([#51](https://github.com/cucumber/cucumber-js/issues/51), Julien Biezemans)

### Fixed
- Remove commented code (Julien Biezemans)

## [0.2.14]
### Added
- Mention CS support in README (Julien Biezemans)
- Update command-line documentation in README (Julien Biezemans)

### Fixed
- Add alternate binary script for Windows ([#60](https://github.com/cucumber/cucumber-js/issues/60), Julien Biezemans)

## [0.2.13]
### Added
- Add support for string-based step definition patterns ([#48](https://github.com/cucumber/cucumber-js/issues/48), Ted de Koning, Julien Biezemans)

### Fixed
- Pass step instance to step definition invocation ([#57](https://github.com/cucumber/cucumber-js/issues/57), Julien Biezemans)
- Refactor step result specs (Julien Biezemans)
- Store step on step results ([#57](https://github.com/cucumber/cucumber-js/issues/57), Julien Biezemans)
- Increase Aruba timeout delay for slow Travis (Julien Biezemans)
- Decouple pattern from regexp in step definition ([#48](https://github.com/cucumber/cucumber-js/issues/48), Julien Biezemans)

## [0.2.12]
### Changed
- Allow World constructor to set explicit World object ([#50](https://github.com/cucumber/cucumber-js/issues/50), Julien Biezemans)

### Fixed
- Add semicolons (Julien Biezemans)
- Add documentation about World to README (Julien Biezemans)

## [0.2.11]
### Changed
- Simplify World callbacks ([#49](https://github.com/cucumber/cucumber-js/issues/49), Julien Biezemans)

### Fixed
- Fix callback.fail() when called without any reasons (Julien Biezemans)
- Add toHaveBeenCalledWithInstanceOfConstructorAsNthParameter() spec helper (Julien Biezemans)
- Simplify default World constructor callback (Julien Biezemans)
- Adapt World constructors (Julien Biezemans)

## [0.2.10]
### Fixed
- Fix path handling on Windows platforms ([#47](https://github.com/cucumber/cucumber-js/issues/47), Julien Biezemans)
- Add tagged hooks example to README (Julien Biezemans)
- Fix browserify setup for example page load (Julien Biezemans)
- Rename bundle to 'cucumber.js' in web example (Julien Biezemans)
- Remove obsolete browserify directive (Julien Biezemans)
- Improve platform detection (Julien Biezemans)

## [0.2.9]
### Added
- Add support for tagged hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)

### Changed
- Allow for whitespaces in tag groups (Julien Biezemans)

### Fixed
- Add Cucumber.Type.String and String#trim(, Julien Biezemans)
- Remove unnecessary this. from stepdefs (Julien Biezemans)
- Simplify tag-related stepdefs (Julien Biezemans)
- Simplify tag selection syntax in volatile configuration (Julien Biezemans)
- Mark hooks "done" in README dev status (Julien Biezemans)

## [0.2.8]
### Added
- Add around hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)

### Changed
- Treat undefined and skipped step as any other step (Julien Biezemans)

### Fixed
- Remove unused parameter in parser spec (Julien Biezemans)
- Add JS stepdef for async failing steps scenario (Julien Biezemans)
- Assign zombie in README example ([#44](https://github.com/cucumber/cucumber-js/issues/44), Julien Biezemans)
- Remove trailing spaces (Julien Biezemans)
- Get rid of obsolete PendingStepException (Julien Biezemans)
- Refactor SupportCode.Library spec (Julien Biezemans)
- Add around hooks documentation ([#32](https://github.com/cucumber/cucumber-js/issues/32), Julien Biezemans)

## [0.2.7]
### Added
- Allow for asynchronous pending steps (Julien Biezemans)
- Allow for asynchronous step failures (Julien Biezemans)

### Fixed
- Fix matching groups in step definition snippets ([#42](https://github.com/cucumber/cucumber-js/issues/42), Julien Biezemans)
- Remove obsolete dependency from snippet builder spec (Julien Biezemans)
- Add steps to release process in README (Julien Biezemans)
- Update development status table in README (Julien Biezemans)
- Import implementation-specific scenarios from cucumber-tck/undefined_steps (Julien Biezemans)
- Switch from throwing exceptions to callback.fail() in web example (Julien Biezemans)
- Add callback.fail() example to README (Julien Biezemans)

## [0.2.6]
### Added
- Add tags support ([#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
- Add support for tags on features ([#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)

### Changed
- Handle missing instance in World constructor callback ([#40](https://github.com/cucumber/cucumber-js/issues/40), Julien Biezemans)

### Fixed
- Update development status in README (Julien Biezemans)
- Typo in README (Julien Biezemans)
- Refactor parser and add AST assembler (required by [#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
- Indent properly (Julien Biezemans)
- Refactor AST assembler to be stateful (needed by [#7](https://github.com/cucumber/cucumber-js/issues/7), Julien Biezemans)
- Update master diff in History (Julien Biezemans)
- Add --tags documentation to --help (CLI, Julien Biezemans)

## [0.2.5]
### Added
- Add Before/After hooks ([#32](https://github.com/cucumber/cucumber-js/issues/32), [#31](https://github.com/cucumber/cucumber-js/issues/31), Tristan Dunn)

### Changed
- Interpret "*" step keyword as a repeat keyword (Julien Biezemans)

### Fixed
- Add NPM publishing to README release checklist (Julien Biezemans)
- Add "Help & Support" to README (Julien Biezemans)
- Words in README (Julien Biezemans)
- Document before and after hooks (Julien Biezemans)

## [0.2.4]
### Added
- Add --version to CLI (Julien Biezemans)
- Add --help to CLI (Julien Biezemans)

### Changed
- Add styles for reported errors on web example (Julien Biezemans)
- Make and expect World constructors to be asynchronous ([#39](https://github.com/cucumber/cucumber-js/issues/39), Julien Biezemans)

### Fixed
- Update README (Julien Biezemans)
- Add development status to README (Julien Biezemans)
- Add link to demo at cucumber.no.de (Julien Biezemans)
- Add link to example app to README (Julien Biezemans)
- Add usage documentation to README ([#23](https://github.com/cucumber/cucumber-js/issues/23), Olivier Melcher)
- Add examples to run features with the CLI (Olivier Melcher)
- Fix header levels and whitespaces in README (Julien Biezemans)
- Add Opera to supported browsers in README (Julien Biezemans)
- Fix World constructor in README (Julien Biezemans)
- Simplify World#visit in README (Julien Biezemans)
- Rewrite step definition and wrapper documentation (Julien Biezemans)
- Remove useless words (Julien Biezemans)
- Use more consistent Markdown in README (Julien Biezemans)
- Fix Gherkin comment in README (Julien Biezemans)
- Add credits (Julien Biezemans)
- Add Aruba setup details to README (Julien Biezemans)
- Fix World constructor on web example according to the recent API changes (Julien Biezemans)
- Tell Travis CI to post build results to #cucumber (Julien Biezemans)
- Add release checklist to README (Julien Biezemans)

## [0.2.3]
### Added
- Add support for Node 0.6 (Julien Biezemans)

### Fixed
- Prevent the same step definition snippet from being suggested twice (Julien Biezemans)
- Don't make NPM ignore `example/` anymore (Julien Biezemans)
- Bump cucumber-features (Julien Biezemans)
- Use non-deprecated "url" key instead of "web" in NPM manifest (Julien Biezemans)
- Add JS step definitions related to data table scenarios (Julien Biezemans)
- Move from cucumber-features to cucumber-tck (Julien Biezemans)
- Bump Gherkin (Julien Biezemans)
- Bump jasmine-node (Julien Biezemans)
- Bump connect (Julien Biezemans)
- Fix Travis build (Julien Biezemans)
- Bump browserify (Julien Biezemans)
- Bump nopt (Julien Biezemans)
- Bump underscore (Julien Biezemans)
- Bump underscore.string (Julien Biezemans)
- Bump rimraf (Julien Biezemans)
- Bump mkdirp (Julien Biezemans)
- Bump Aruba (Julien Biezemans)

## [0.2.2]
### Added
- Suggest step definition snippets for undefined steps ([#33](https://github.com/cucumber/cucumber-js/issues/33), Julien Biezemans)

### Fixed
- Add contributors to NPM package manifest (Julien Biezemans)
- Clean up JS step definitions (Julien Biezemans)
- Bump cucumber-features and reflect step changes (Julien Biezemans)
- Set up [continuous integration on Travis CI](http://travis-ci.org/#!/cucumber/cucumber-js) (Julien Biezemans)
- Add Travis's build status icon to README (Julien Biezemans)

## [0.2.1]
### Added
- Allow custom World constructors (Julien Biezemans)
- Add support for data tables (with conversion to hashes) ([#12](https://github.com/cucumber/cucumber-js/issues/12), Julien Biezemans)

### Changed
- Demonstrate World object usages in web example (Julien Biezemans)

## [0.2.0]
### Added
- Setup application to run on [Travis CI](http://travis-ci.org/#!/jbpros/cucumber-js) (Julien Biezemans)
- Add CoffeeScript support for step definition files (Paul Jensen)
- Add "World" ([#26](https://github.com/cucumber/cucumber-js/issues/26), Julien Biezemans)

### Changed
- Add link to the Github repository on web example (Julien Biezemans)
- Allow specifying the port the web example server should listen on (Julien Biezemans)
- Update web example to use cucumber-html formatter (Julien Biezemans)

### Fixed
- Fix load paths in spec helper (Julien Biezemans)
- Prevent 'crypto' module from being included by browserify in web example (Julien Biezemans)
- Fix HTML indentation (Julien Biezemans)
- Prevent CLI support code loader from calling module main exports which are not functions (Julien Biezemans)
- Remove use of username for submodule (Kushal Pisavadia)
- Bump jasmine-node
- Update README (Julien Biezemans)
- Bump Gherkin twice (Julien Biezemans)
- Bump cucumber-features twice (Julien Biezemans)
- Add missing getters on several AST feature elements (mostly getLine()) (Julien Biezemans)
- Ignore example/ on NPM (Julien Biezemans)
- Add Procfile (used by Heroku when deploying to cucumber.heroku.com) (Julien Biezemans)
- Bump Aruba (Julien Biezemans)
- Add guard-jasmine-node (Julien Biezemans)
- Improve Guardfile regular expressions (Julien Biezemans)
- Bump cucumber-html and remove DOM templates from web example HTML file (Julien Biezemans)
- Fix PathExpander internal name (Julien Biezemans)
- Remove unneeded requires from FeaturePathExpander (Julien Biezemans)
- Bump browserify (Julien Biezemans)
- Remove "glob" from dependencies (Julien Biezemans)
- Refactor SupportCodePathExpander spec (Julien Biezemans)
- Add feature for CoffeeScript support ([#29](https://github.com/cucumber/cucumber-js/issues/29), Julien Biezemans)

## [0.1.5]
### Added
- Add support for background ([#9](https://github.com/cucumber/cucumber-js/issues/9), Julien Biezemans)

### Fixed
- Bump cucumber-features (twice) (Julien Biezemans)
- Bump gherkin and reflect changes in its API (add DocString content type) (Julien Biezemans)

## [0.1.4]
### Changed
- Stop polluting the global namespace with Given(), When() and Then() ([#2](https://github.com/cucumber/cucumber-js/issues/2), Julien Biezemans)
- Step definitions can be created with the support code helper passed as 'this':
this.Given(), this.When(), this.Then() and this.defineStep() ([#2](https://github.com/cucumber/cucumber-js/issues/2), Julien Biezemans)

### Fixed
- Fix typo "occured" -> "occurred" (Fernando Acorreia)
- Improve variable names in CLI support code loader (Julien Biezemans)

## [0.1.3]
### Added
- Allow several features to run at once ([#14](https://github.com/cucumber/cucumber-js/issues/14), Julien Biezemans)
- Add support for --require (Julien Biezemans)

### Fixed
- Improve features and support code API (Julien Biezemans)
- Add "Cli" and "Volatile" configurations (Julien Biezemans)
- Internal refactoring and cleanup (Julien Biezemans)
- Cucumber.js can now fully test itself (Julien Biezemans)
- Remove run_all_features script in favor of bin/cucumber.js (Julien Biezemans)

## [0.1.2]
### Added
- Add failure reporting to the progress formatter ([#20](https://github.com/cucumber/cucumber-js/issues/20), Julien Biezemans)

## [0.1.1]
### Added
- Publish Cucumber.js to NPM as [`cucumber`](https://www.npmjs.com/search?q=cucumber) (Julien Biezemans)

### Changed
- Throw a clearer exception on missing feature argument (CLI) (Julien Biezemans)

### Fixed
- Unify and clean up js-specific features and step definitions ([#21](https://github.com/cucumber/cucumber-js/issues/21), Julien Biezemans)

## [0.1.0]
### Added
- Add cucumber.js executable (Julien Biezemans)
- Handle step failures ([#6](https://github.com/cucumber/cucumber-js/issues/6), Julien Biezemans)
- Add the progress formatter ([#16](https://github.com/cucumber/cucumber-js/issues/16), Julien Biezemans)
- Add support for pending steps ([#18](https://github.com/cucumber/cucumber-js/issues/18), Julien Biezemans)
- Add support for undefined steps ([#19](https://github.com/cucumber/cucumber-js/issues/19), Julien Biezemans)

### Changed
- Update web example to use the new progress formatter (Julien Biezemans)

### Fixed
- Fix asynchronous step definition callbacks ([#1](https://github.com/cucumber/cucumber-js/issues/1), Julien Biezemans)
- Fix stepResult.isSuccessful call in ProgressFormatter (Julien Biezemans)
- Load Gherkin properly in browsers (Julien Biezemans)
- Remove calls to console.log in web example (Julien Biezemans)
- Pass against core.feature in its new form, both with the Cucumber-ruby/Aruba pair and cucumber-js itself (Julien Biezemans)
- Refactor cucumber-features JS mappings (Julien Biezemans)
- Refactor js-specific features (Julien Biezemans)
- Rename PyString to DocString ([#15](https://github.com/cucumber/cucumber-js/issues/15), Julien Biezemans)
- Update Gherkin to 2.4.0 (Julien Biezemans)
- Modularize the project and use browserify.js to serve a single JS file to browsers. ([#3](https://github.com/cucumber/cucumber-js/issues/3), Julien Biezemans)
- Rename Cucumber.Types to Cucumber.Type (Julien Biezemans)
- Use progress formatter in cucumber-features ([#17](https://github.com/cucumber/cucumber-js/issues/17), Julien Biezemans)

## 0.0.1

[Unreleased]: https://github.com/cucumber/cucumber-js/compare/v9.2.0...HEAD
[9.2.0]: https://github.com/cucumber/cucumber-js/compare/v9.1.2...v9.2.0
[9.1.2]: https://github.com/cucumber/cucumber-js/compare/v9.1.1...v9.1.2
[9.1.1]: https://github.com/cucumber/cucumber-js/compare/v9.1.0...v9.1.1
[9.1.0]: https://github.com/cucumber/cucumber-js/compare/v9.0.1...v9.1.0
[9.0.1]: https://github.com/cucumber/cucumber-js/compare/v9.0.0...v9.0.1
[9.0.0]: https://github.com/cucumber/cucumber-js/compare/v8.11.1...v9.0.0
[8.11.1]: https://github.com/cucumber/cucumber-js/compare/v8.11.0...v8.11.1
[8.11.0]: https://github.com/cucumber/cucumber-js/compare/v8.10.0...v8.11.0
[8.10.0]: https://github.com/cucumber/cucumber-js/compare/v8.9.1...v8.10.0
[8.9.1]: https://github.com/cucumber/cucumber-js/compare/v8.9.0...v8.9.1
[8.9.0]: https://github.com/cucumber/cucumber-js/compare/v8.8.0...v8.9.0
[8.8.0]: https://github.com/cucumber/cucumber-js/compare/v8.7.0...v8.8.0
[8.7.0]: https://github.com/cucumber/cucumber-js/compare/v8.6.0...v8.7.0
[8.6.0]: https://github.com/cucumber/cucumber-js/compare/v8.5.3...v8.6.0
[8.5.3]: https://github.com/cucumber/cucumber-js/compare/v8.5.2...v8.5.3
[8.5.2]: https://github.com/cucumber/cucumber-js/compare/v8.5.1...v8.5.2
[8.5.1]: https://github.com/cucumber/cucumber-js/compare/v8.5.0...v8.5.1
[8.5.0]: https://github.com/cucumber/cucumber-js/compare/v8.4.0...v8.5.0
[8.4.0]: https://github.com/cucumber/cucumber-js/compare/v8.3.1...v8.4.0
[8.3.1]: https://github.com/cucumber/cucumber-js/compare/v8.3.0...v8.3.1
[8.3.0]: https://github.com/cucumber/cucumber-js/compare/v8.2.2...v8.3.0
[8.2.2]: https://github.com/cucumber/cucumber-js/compare/v8.2.1...v8.2.2
[8.2.1]: https://github.com/cucumber/cucumber-js/compare/v8.2.0...v8.2.1
[8.2.0]: https://github.com/cucumber/cucumber-js/compare/v8.1.2...v8.2.0
[8.1.2]: https://github.com/cucumber/cucumber-js/compare/v8.1.1...v8.1.2
[8.1.1]: https://github.com/cucumber/cucumber-js/compare/v8.1.0...v8.1.1
[8.1.0]: https://github.com/cucumber/cucumber-js/compare/v8.0.0...v8.1.0
[8.0.0]: https://github.com/cucumber/cucumber-js/compare/v8.0.0-rc.3...v8.0.0
[8.0.0-rc.3]: https://github.com/cucumber/cucumber-js/compare/v8.0.0-rc.2...v8.0.0-rc.3
[8.0.0-rc.2]: https://github.com/cucumber/cucumber-js/compare/v8.0.0-rc.1...v8.0.0-rc.2
[8.0.0-rc.1]: https://github.com/cucumber/cucumber-js/compare/v7.3.1...8.0.0-rc.1
[7.3.2]: https://github.com/cucumber/cucumber-js/compare/v7.3.1...v7.3.2
[7.3.1]: https://github.com/cucumber/cucumber-js/compare/v7.3.0...v7.3.1
[7.3.0]: https://github.com/cucumber/cucumber-js/compare/v7.2.1...v7.3.0
[7.2.1]: https://github.com/cucumber/cucumber-js/compare/v7.2.0...v7.2.1
[7.2.0]: https://github.com/cucumber/cucumber-js/compare/v7.1.0...v7.2.0
[7.1.0]: https://github.com/cucumber/cucumber-js/compare/v7.0.0-rc.0...v7.1.0
[7.0.0]: https://github.com/cucumber/cucumber-js/compare/v6.0.5...v7.0.0
[7.0.0-rc.0]: https://github.com/cucumber/cucumber-js/compare/v7.0.0...v7.0.0-rc.0
[6.0.5]: https://github.com/cucumber/cucumber-js/compare/v6.0.4...v6.0.5
[6.0.4]: https://github.com/cucumber/cucumber-js/compare/v6.0.3...v6.0.4
[6.0.3]: https://github.com/cucumber/cucumber-js/compare/v6.0.2...v6.0.3
[6.0.2]: https://github.com/cucumber/cucumber-js/compare/v6.0.1...v6.0.2
[6.0.1]: https://github.com/cucumber/cucumber-js/compare/v6.0.0...v6.0.1
[6.0.0]: https://github.com/cucumber/cucumber-js/compare/v5.1.0...v6.0.0
[5.1.0]: https://github.com/cucumber/cucumber-js/compare/v5.0.3...v5.1.0
[5.0.3]: https://github.com/cucumber/cucumber-js/compare/v5.0.2...v5.0.3
[5.0.2]: https://github.com/cucumber/cucumber-js/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/cucumber/cucumber-js/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/cucumber/cucumber-js/compare/v4.2.1...v5.0.0
[4.2.1]: https://github.com/cucumber/cucumber-js/compare/v4.1.0...v4.2.1
[4.1.0]: https://github.com/cucumber/cucumber-js/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/cucumber/cucumber-js/compare/v3.2.1...v4.0.0
[3.2.1]: https://github.com/cucumber/cucumber-js/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/cucumber/cucumber-js/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/cucumber/cucumber-js/compare/v3.0.6...v3.1.0
[3.0.6]: https://github.com/cucumber/cucumber-js/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/cucumber/cucumber-js/compare/v3.0.4...v3.0.5
[3.0.4]: https://github.com/cucumber/cucumber-js/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/cucumber/cucumber-js/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/cucumber/cucumber-js/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/cucumber/cucumber-js/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/cucumber/cucumber-js/compare/v2.3.1...v3.0.0
[2.3.1]: https://github.com/cucumber/cucumber-js/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/cucumber/cucumber-js/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/cucumber/cucumber-js/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.9...v2.1.0
[1.3.3]: https://github.com/cucumber/cucumber-js/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/cucumber/cucumber-js/compare/v1.3.1...v1.3.2
[2.0.0-rc.9]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.8...v2.0.0-rc.9
[2.0.0-rc.8]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.7...v2.0.0-rc.8
[2.0.0-rc.7]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.6...v2.0.0-rc.7
[2.0.0-rc.6]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.5...v2.0.0-rc.6
[2.0.0-rc.5]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.4...v2.0.0-rc.5
[2.0.0-rc.4]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.3...v2.0.0-rc.4
[2.0.0-rc.3]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.2...v2.0.0-rc.3
[2.0.0-rc.2]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.1...v2.0.0-rc.2
[2.0.0-rc.1]: https://github.com/cucumber/cucumber-js/compare/v2.0.0-rc.0...v2.0.0-rc.1
[2.0.0-rc.0]: https://github.com/cucumber/cucumber-js/compare/v1.3.3...v2.0.0-rc.0
[1.3.1]: https://github.com/cucumber/cucumber-js/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/cucumber/cucumber-js/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/cucumber/cucumber-js/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/cucumber/cucumber-js/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/cucumber/cucumber-js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/cucumber/cucumber-js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/cucumber/cucumber-js/compare/v0.9.5...v1.0.0
[0.10.4]: https://github.com/cucumber/cucumber-js/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/cucumber/cucumber-js/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/cucumber/cucumber-js/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/cucumber/cucumber-js/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/cucumber/cucumber-js/compare/v0.1.5...v0.10.0
[0.9.5]: https://github.com/cucumber/cucumber-js/compare/v0.9.4...v0.9.5
[0.9.4]: https://github.com/cucumber/cucumber-js/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/cucumber/cucumber-js/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/cucumber/cucumber-js/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/cucumber/cucumber-js/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/cucumber/cucumber-js/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/cucumber/cucumber-js/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/cucumber/cucumber-js/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/cucumber/cucumber-js/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/cucumber/cucumber-js/compare/v0.5.3...v0.6.0
[0.5.3]: https://github.com/cucumber/cucumber-js/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/cucumber/cucumber-js/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/cucumber/cucumber-js/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/cucumber/cucumber-js/compare/v0.4.9...v0.5.0
[0.4.9]: https://github.com/cucumber/cucumber-js/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/cucumber/cucumber-js/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/cucumber/cucumber-js/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/cucumber/cucumber-js/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/cucumber/cucumber-js/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/cucumber/cucumber-js/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/cucumber/cucumber-js/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/cucumber/cucumber-js/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/cucumber/cucumber-js/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/cucumber/cucumber-js/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/cucumber/cucumber-js/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/cucumber/cucumber-js/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/cucumber/cucumber-js/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/cucumber/cucumber-js/compare/v0.2.9...v0.3.0
[0.2.22]: https://github.com/cucumber/cucumber-js/compare/v0.2.21...v0.2.22
[0.2.21]: https://github.com/cucumber/cucumber-js/compare/v0.2.20...v0.2.21
[0.2.20]: https://github.com/cucumber/cucumber-js/compare/v0.2.2...v0.2.20
[0.2.19]: https://github.com/cucumber/cucumber-js/compare/v0.2.18...v0.2.19
[0.2.18]: https://github.com/cucumber/cucumber-js/compare/v0.2.17...v0.2.18
[0.2.17]: https://github.com/cucumber/cucumber-js/compare/v0.2.16...v0.2.17
[0.2.16]: https://github.com/cucumber/cucumber-js/compare/v0.2.15...v0.2.16
[0.2.15]: https://github.com/cucumber/cucumber-js/compare/v0.2.14...v0.2.15
[0.2.14]: https://github.com/cucumber/cucumber-js/compare/v0.2.13...v0.2.14
[0.2.13]: https://github.com/cucumber/cucumber-js/compare/v0.2.12...v0.2.13
[0.2.12]: https://github.com/cucumber/cucumber-js/compare/v0.2.11...v0.2.12
[0.2.11]: https://github.com/cucumber/cucumber-js/compare/v0.2.10...v0.2.11
[0.2.10]: https://github.com/cucumber/cucumber-js/compare/v0.2.1...v0.2.10
[0.2.9]: https://github.com/cucumber/cucumber-js/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/cucumber/cucumber-js/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/cucumber/cucumber-js/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/cucumber/cucumber-js/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/cucumber/cucumber-js/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/cucumber/cucumber-js/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/cucumber/cucumber-js/compare/v0.2.22...v0.2.3
[0.2.2]: https://github.com/cucumber/cucumber-js/compare/v0.2.19...v0.2.2
[0.2.1]: https://github.com/cucumber/cucumber-js/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/cucumber/cucumber-js/compare/v0.10.4...v0.2.0
[0.1.5]: https://github.com/cucumber/cucumber-js/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/cucumber/cucumber-js/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/cucumber/cucumber-js/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/cucumber/cucumber-js/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/cucumber/cucumber-js/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/cucumber/cucumber-js/compare/v0.0.1...v0.1.0

<h1 align="center">
  <img src="https://raw.githubusercontent.com/cucumber/cucumber-js/main/docs/images/logo.svg" alt="">
  <br>
  Cucumber
</h1>
<p align="center">
  <b>Automated tests in plain language, for Node.js</b>
</p>

[![npm](https://img.shields.io/npm/v/@cucumber/cucumber.svg)](https://www.npmjs.com/package/@cucumber/cucumber)
[![GitHub Actions](https://github.com/cucumber/cucumber-js/workflows/Build/badge.svg)](https://github.com/cucumber/cucumber-js/actions)
[![OpenCollective](https://opencollective.com/cucumber/backers/badge.svg)](https://opencollective.com/cucumber)
[![OpenCollective](https://opencollective.com/cucumber/sponsors/badge.svg)](https://opencollective.com/cucumber)
[![pull requests](https://oselvar.com/api/badge?label=pull%20requests&csvUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fcucumber%2Foselvar-github-metrics%2Fmain%2Fdata%2Fcucumber%2Fcucumber-js%2FpullRequests.csv)](https://oselvar.com/github/cucumber/oselvar-github-metrics/main/cucumber/cucumber-js)
[![issues](https://oselvar.com/api/badge?label=issues&csvUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fcucumber%2Foselvar-github-metrics%2Fmain%2Fdata%2Fcucumber%2Fcucumber-js%2Fissues.csv)](https://oselvar.com/github/cucumber/oselvar-github-metrics/main/cucumber/cucumber-js)
[![Coverage Status](https://coveralls.io/repos/github/cucumber/cucumber-js/badge.svg?branch=master)](https://coveralls.io/github/cucumber/cucumber-js?branch=master)

[Cucumber](https://cucumber.io) is a tool for running automated tests written in plain language. Because they're
written in plain language, they can be read by anyone on your team. Because they can be
read by anyone, you can use them to help improve communication, collaboration and trust on
your team.

This is the JavaScript implementation of Cucumber. It runs on the [maintained Node.js versions](https://github.com/nodejs/Release).

You can [quickly try it in your browser](https://codesandbox.io/s/cucumber-js-demo-2p3vrl?file=/features/greeting.feature), or read on to get started locally in a couple of minutes.

## Install

Cucumber is available via npm:

```shell
$ npm install @cucumber/cucumber
```

## Quick Start

Let's take this example of something to test:

```js
class Greeter {
  sayHello() {
    return 'hello'
  }
}
```

First, write your feature in `features/greeting.feature`:

```gherkin
Feature: Greeting

  Scenario: Say hello
    When the greeter says hello
    Then I should have heard "hello"
```

Next, implement your steps in `features/support/steps.js`:

```js
const assert = require('assert')
const { When, Then } = require('@cucumber/cucumber')
const { Greeter } = require('../../src')

When('the greeter says hello', function () {
  this.whatIHeard = new Greeter().sayHello()
});

Then('I should have heard {string}', function (expectedResponse) {
  assert.equal(this.whatIHeard, expectedResponse)
});
```

Finally, run Cucumber:

```shell
$ npx cucumber-js
```

## Help & support

* See here: https://cucumber.io/support.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for info on contributing to Cucumber.js.

## Code of Conduct

Everyone interacting in this codebase and issue tracker is expected to follow the Cucumber [code of conduct](https://github.com/cucumber/cucumber/blob/master/CODE_OF_CONDUCT.md).

## Documentation

If you learn best by example, we have [a repo with several example projects](https://github.com/cucumber-examples/cucumber-js-examples) that might help you get going. Otherwise, read on.

The following documentation is for `main`, which might contain some unreleased features. See below the documentation for older versions.

* [CLI](./docs/cli.md)
* [Configuration](./docs/configuration.md)
* Support Files
  * [World](./docs/support_files/world.md)
  * [Step Definitions](./docs/support_files/step_definitions.md)
  * [Hooks](./docs/support_files/hooks.md)
  * [Timeouts](./docs/support_files/timeouts.md)
  * [Data Table Interface](./docs/support_files/data_table_interface.md)
  * [Attachments](./docs/support_files/attachments.md)
  * [API Reference](./docs/support_files/api_reference.md)
* Guides
  * [Dry run](./docs/dry_run.md)
  * [ES Modules](./docs/esm.md)
  * [Failing fast](./docs/fail_fast.md)
  * [Filtering](./docs/filtering.md)
  * [Formatters](./docs/formatters.md)
  * [Running in parallel](./docs/parallel.md)
  * [Profiles](./docs/profiles.md)
  * [Rerunning just failures](./docs/rerun.md)
  * [Retrying flaky scenarios](./docs/retry.md)
  * [Snippets for undefined steps](./docs/snippets.md)
  * [Transpiling (from TypeScript etc)](./docs/transpiling.md)
* [FAQ](./docs/faq.md)

### Documentation for older versions

* [`7.x`](https://github.com/cucumber/cucumber-js/tree/7.x)
* [`6.x`](https://github.com/cucumber/cucumber-js/tree/6.x)
* [`5.x`](https://github.com/cucumber/cucumber-js/tree/5.x)
* [`4.x`](https://github.com/cucumber/cucumber-js/tree/4.x)
* [`3.x`](https://github.com/cucumber/cucumber-js/tree/3.x)
* [`2.x`](https://github.com/cucumber/cucumber-js/tree/2.x)
* [`1.x`](https://github.com/cucumber/cucumber-js/tree/1.x)

[![OpenCollective](https://opencollective.com/cucumber/backers/badge.svg)](https://opencollective.com/cucumber)
[![OpenCollective](https://opencollective.com/cucumber/sponsors/badge.svg)](https://opencollective.com/cucumber)
[![pull requests](https://oselvar.com/api/badge?label=pull%20requests&csvUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fcucumber%2Foselvar-github-metrics%2Fmain%2Fdata%2Fcucumber%2Fcucumber-js%2FpullRequests.csv)](https://oselvar.com/github/cucumber/oselvar-github-metrics/main/cucumber/cucumber-js)
[![issues](https://oselvar.com/api/badge?label=issues&csvUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fcucumber%2Foselvar-github-metrics%2Fmain%2Fdata%2Fcucumber%2Fcucumber-js%2Fissues.csv)](https://oselvar.com/github/cucumber/oselvar-github-metrics/main/cucumber/cucumber-js)

[![GitHub Actions](https://github.com/cucumber/cucumber-js/workflows/Build/badge.svg)](https://github.com/cucumber/cucumber-js/actions)
[![Dependencies](https://david-dm.org/cucumber/cucumber-js.svg)](https://david-dm.org/cucumber/cucumber-js)
[![Coverage Status](https://coveralls.io/repos/github/cucumber/cucumber-js/badge.svg?branch=master)](https://coveralls.io/github/cucumber/cucumber-js?branch=master)

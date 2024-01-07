# JavaScript API

You can run Cucumber programmatically via its JavaScript API. This isn't something most users would need to do, but if you have a niche use case or need to work Cucumber into a bigger framework, it might be what you need. The API allows you to load configuration, sources and support code and execute test runs via async functions and within the current process.

The API is available on its own entry point `@cucumber/cucumber/api`.

## Reference documentation

You can find full reference documentation for this module at  
<https://cucumber.github.io/cucumber-js/modules/api.html>

## Minimal example

```javascript
import { loadConfiguration, runCucumber } from '@cucumber/cucumber/api'

const { runConfiguration } = await loadConfiguration()
const { success } = await runCucumber(runConfiguration)
console.log(success)
```

## Concepts

### Environment

`runCucumber` and the other functions in this module all accept an `environment` argument. It consists of:

- `cwd`
- `stdout`
- `stderr`
- `env`
- `debug`

These influence a lot of core behaviour, like where we start looking for files and where output is written. Often, though, the default values (from `process`) are going to be fine. As such, you can omit any of these values, or the entire object, and Cucumber will just fill the gaps with the defaults. 

### Configuration

Configuration for running Cucumber consists of various options. It can take two different shapes, which each make sense at different points in the lifecycle for different reasons.

#### "User" configuration

A simple, flat format. This is how configuration is expressed by users in configuration files and on the CLI. Users can provide a partial configuration and any gaps are filled with defaults, but here's a filled-out example:

```json
{
  "backtrace": true,
  "dryRun": false,
  "forceExit": false,
  "failFast": true,
  "format": [
    "progress-bar",
    ["html", "./reports/cucumber.html"]
  ],
  "formatOptions": {},
  "import": ["features/support/**/*.js"],
  "language": "en",
  "name": [],
  "order": "defined",
  "paths": ["features/**/*.feature"],
  "parallel": 3,
  "publish": false,
  "publishQuiet": false,
  "require": [],
  "requireModule": [],
  "retry": 2,
  "retryTagFilter": "@flaky",
  "strict": true,
  "tags": "@interesting",
  "worldParameters": {}
}
```

#### "Run" configuration

A more structured format with several distinct blocks. You might notice it contains more or less the same data, but in a shape that's more useful for `runCucumber`, which accepts this as its options argument. Also, everything is required. Here's the equivalent to the "user" configuration example:

```json
{
  "sources": {
    "defaultDialect": "en",
    "paths": [
      "features/**/*.feature"
    ],
    "name": [],
    "tagExpression": "@interesting",
    "order": "defined"
  },
  "support": {
    "importPaths": [
      "features/support/**/*.js"
    ],
    "requireModules": [],
    "requirePaths": []
  },
  "formats": {
    "files": {
      "./reports/cucumber.html": "html"
    },
    "options": {},
    "publish": false,
    "stdout": "progress-bar"
  },
  "runtime": {
    "dryRun": false,
    "failFast": true,
    "filterStacktraces": false,
    "parallel": 3,
    "retry": 2,
    "retryTagFilter": "@flaky",
    "strict": true,
    "worldParameters": {}
  }
}
```

Having this structure for `runCucumber` has some advantages:

- It represents a separation of concerns between modules of the codebase that deal with different aspects of the lifecycle
- It allows some blocks to be replaced with other values that achieve the same thing (see [Preloading and reusing support code](#preloading-and-reusing-support-code) below)
- It allows a subset of some blocks to be used for other supporting functions (see [Calculating a test plan](#calculating-a-test-plan) below)

### Using configuration in practise

Whilst you need a fully-filled "run" configuration object to call `runCucumber` and friends, it's a bit tedious to hand-author. The recommended pattern is to use `loadConfiguration` to resolve this for you, merging together the defaults, user-authored configuration file, and any extra values you want to provide.

## More examples

### Calculating a test plan

You can use the `loadSources` function to load and parse your feature files, calculate the test plan (accounting for filtering and ordering) and report any parse errors:

```javascript
import { loadConfiguration, loadSources } from '@cucumber/cucumber/api'

const { runConfiguration } = await loadConfiguration()
const { plan } = await loadSources(runConfiguration.sources)
console.dir(plan)
```

### Preloading and reusing support code

If you want to multiple test runs in the same process, you need to reuse the same support library across the runs. This is because your code is cached by Node.js the first time it's imported, and subsequent imports won't cause your calls to `Given` etc to happen again.

You can use the `loadSupport` function to load the support code library once upfront, and pass that into `runCucumber` as many times as you want in place of the `support` part of the options object:

```javascript
import { loadConfiguration, loadSupport, runCucumber } from '@cucumber/cucumber/api'

const { runConfiguration } = await loadConfiguration()
const support = await loadSupport(runConfiguration)
const result1 = await runCucumber({ ...runConfiguration, support })
const result2 = await runCucumber({ ...runConfiguration, support })
const result3 = await runCucumber({ ...runConfiguration, support })
```

Similarly, each result from `runCucumber` includes the support code library that was used, so you can just grab that from your first run and reuse it in subsequent runs, if that suits your flow better: 

```javascript
import { loadConfiguration, loadSupport, runCucumber } from '@cucumber/cucumber/api'

const { runConfiguration } = await loadConfiguration()
const { support, ...result1 } = await runCucumber(runConfiguration)
const result2 = await runCucumber({ ...runConfiguration, support })
const result3 = await runCucumber({ ...runConfiguration, support })
```

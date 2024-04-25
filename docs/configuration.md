_**You are reading the documentation in the `main` development branch, which might contain some unreleased features. See documentation for [older versions](https://github.com/cucumber/cucumber-js/blob/main/docs/older_versions.md) if you need it.**_

----

# Configuration

## Files

You can keep your configuration in a file. Cucumber will look for one of these files in the root of your project, and use the first one it finds:

- `cucumber.json`
- `cucumber.yaml`
- `cucumber.yml`
- `cucumber.js`
- `cucumber.cjs`
- `cucumber.mjs`

You can also put your file somewhere else and tell Cucumber via the `--config` CLI option:

```shell
cucumber-js --config config/cucumber.json
```

Here's a concise example of a configuration file in JSON format:

```json
{
  "default": {
    "parallel": 2,
    "format": ["html:cucumber-report.html"]
  }
}
```

And the same in YAML format:

```yaml
default:
  parallel: 2
  format:
    - "html:cucumber-report.html"
```

And the same in JavaScript (ESM) format:

```js
export default {
  parallel: 2,
  format: ['html:cucumber-report.html']
}
```

And the same in JavaScript (CommonJS) format:

```js
module.exports = {
  default: {
    parallel: 2,
    format: ['html:cucumber-report.html']
  }
}
```

Cucumber also supports the configuration being a string of options in the style of the CLI, though this isn't recommended:

```js
module.exports = {
  default: '--parallel 2 --format html:cucumber-report.html'
}
```

(If you're wondering why the configuration sits within a "default" property, that's to allow for [Profiles](./profiles.md).)

## Options

These options can be used in a configuration file (see [above](#files)) or on the [CLI](./cli.md), or both.

- Where options are repeatable, they are appended/merged if provided more than once.
- Where options aren't repeatable, the CLI takes precedence over a configuration file.

| Name              | Type       | Repeatable | CLI Option                | Description                                                                                                        | Default |
|-------------------|------------|------------|---------------------------|--------------------------------------------------------------------------------------------------------------------|---------|
| `paths`           | `string[]` | Yes        | (as arguments)            | Paths to where your feature files are - see [below](#finding-your-features)                                        | []      |
| `backtrace`       | `boolean`  | No         | `--backtrace`, `-b`       | Show the full backtrace for errors                                                                                 | false   |
| `dryRun`          | `boolean`  | No         | `--dry-run`, `-d`         | Prepare a test run but don't run it - see [Dry Run](./dry_run.md)                                                  | false   |    
| `forceExit`       | `boolean`  | No         | `--exit`, `--force-exit`  | Explicitly call `process.exit()` after the test run (when run via CLI) - see [CLI](./cli.md)                       | false   |
| `failFast`        | `boolean`  | No         | `--fail-fast`             | Stop running tests when a test fails - see [Fail Fast](./fail_fast.md)                                             | false   |
| `format`          | `string[]` | Yes        | `--format`, `-f`          | Name/path and (optionally) output file path of each formatter to use - see [Formatters](./formatters.md)           | []      |
| `formatOptions`   | `object`   | Yes        | `--format-options`        | Options to be provided to formatters - see [Formatters](./formatters.md)                                           | {}      |
| `import`          | `string[]` | Yes        | `--import`, `-i`          | Paths to where your support code is                                                                                | []      |
| `language`        | `string`   | No         | `--language`              | Default language for your feature files                                                                            | en      |
| `loader`          | `string[]` | Yes        | `--loader`, `-l`          | Module specifiers for loaders to be registered ahead of loading support code - see [Transpiling](./transpiling.md) | []      |
| `name`            | `string`   | No         | `--name`                  | Regular expressions of which scenario names should match one of to be run - see [Filtering](./filtering.md#names)  | []      |
| `order`           | `string`   | No         | `--order`                 | Run in the order defined, or in a random order - see [Filtering and Ordering](./filtering.md#order)                | defined |
| `parallel`        | `number`   | No         | `--parallel`              | Run tests in parallel with the given number of worker processes - see [Parallel](./parallel.md)                    | 0       |
| `publish`         | `boolean`  | No         | `--publish`               | Publish a report of your test run to <https://reports.cucumber.io/>                                                | false   |
| `require`         | `string[]` | Yes        | `--require`, `-r`         | Paths to where your support code is, for CommonJS - see [below](#finding-your-code)                                | []      |
| `requireModule`   | `string[]` | Yes        | `--require-module`        | Names of transpilation modules to load, loaded via `require()` - see [Transpiling](./transpiling.md)               | []      |
| `retry`           | `number`   | No         | `--retry`                 | Retry failing tests up to the given number of times - see [Retry](./retry.md)                                      | 0       |
| `retryTagFilter`  | `string`   | Yes        | `--retry-tag-filter`      | Tag expression to filter which scenarios can be retried - see [Retry](./retry.md)                                  |         |
| `strict`          | `boolean`  | No         | `--strict`, `--no-strict` | Fail the test run if there are pending steps                                                                       | true    |
| `tags`            | `string`   | Yes        | `--tags`, `-t`            | Tag expression to filter which scenarios should be run - see [Filtering](./filtering.md#tags)                      |         |
| `worldParameters` | `object`   | Yes        | `--world-parameters`      | Parameters to be passed to your World - see [World](./support_files/world.md)                                      | {}      |

## Finding your features

By default, Cucumber finds features that match this glob (relative to your project's root directory):

```
features/**/*.{feature,feature.md}
```

If your features are somewhere else, you can override this by proving your own [glob](https://github.com/isaacs/node-glob) or directory:

- In a configuration file `{ paths: ['somewhere-else/**/*.feature'] }`
- On the CLI `cucumber-js somewhere-else/**/*.feature`

This option is repeatable, so you can provide several values and they'll be combined.

For more granular options to control _which scenarios_ from your features should be run, see [Filtering](./filtering.md).

## Finding your code

By default, Cucumber finds support code files with this logic:

* If the features live in a `features` directory (at any level)
  * `features/**/*.@(js|cjs|mjs)`
* Otherwise
  * `<DIR>/**/*.@(js|cjs|mjs)` for each directory containing the selected features

If your files are somewhere else, you can override this by proving your own [glob](https://github.com/isaacs/node-glob), directory or file path to the `import` configuration option:

- In a configuration file `{ import: ['somewhere-else/support/*.js'] }`
- On the CLI `cucumber-js --import somewhere-else/support/*.js` 

Once you specify any `import` options, the defaults described above are no longer applied. The option is repeatable, so you can provide several values and they'll be combined, meaning you can load files from multiple locations.

The default behaviour and the `import` option both use the [new ES modules API](https://nodejs.org/api/esm.html) to load your files. This should work fine for the majority of cases, but sometimes (e.g. when transpiling with the `require-module` option), you'll need to use the `require` option instead in the same way, and they'll be loaded with the [legacy CommonJS modules API](https://nodejs.org/api/modules.html).

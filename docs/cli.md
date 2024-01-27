# CLI

Cucumber includes an executable file to run your scenarios. After installing the `@cucumber/cucumber` package, you can run it directly:

``` shell
./node_modules/.bin/cucumber-js
```

Or via a [`package.json` script](https://docs.npmjs.com/cli/v8/using-npm/scripts):

```json
{
  "scripts": {
    "cucumber": "cucumber-js"
  }
}
```

Or via [npx](https://docs.npmjs.com/cli/v8/commands/npx):

``` shell
npx cucumber-js
```

## Options

All the [standard configuration options](./configuration.md#options) can be provided via the CLI.

Additionally, there are a few options that are specific to the CLI:

| Option             | Type       | Repeatable | Description                                                                             |
|--------------------|------------|------------|-----------------------------------------------------------------------------------------|
| `--config`, `-c`   | `string`   | No         | Path to your configuration file - see [Files](./configuration.md#files)                 |
| `--profile`, `-p`  | `string[]` | Yes        | Profiles from which to include configuration - see [Profiles](./profiles.md)            |
| `--version`, `-v`  | `boolean`  | No         | Print the currently installed version of Cucumber, then exit immediately                |
| `--i18n-keywords`  | `string`   | No         | Print the Gherkin keywords for the given ISO-639-1 language code, then exit immediately |
| `--i18n-languages` | `boolean`  | No         | Print the supported languages for Gherkin, then exit immediately                        |

To see the available options for your installed version, run:

```shell
cucumber-js --help
```

## Exiting

By default, cucumber exits when the event loop drains. Use the `forceExit` configuration option in order to force shutdown of the event loop when the test run has finished:

- In a configuration file `{ forceExit: true }`
- On the CLI `cucumber-js --force-exit`

This is discouraged, as fixing the issues that causes the hang is a better long term solution. Some potential resources for that are:
* [Node.js guide to debugging](https://nodejs.org/en/docs/inspector/)
* NPM package [why-is-node-running](https://www.npmjs.com/package/why-is-node-running)
* [Node.js Async Hooks](https://nodejs.org/dist/latest-v8.x/docs/api/async_hooks.html)
* Isolating what scenario or scenarios causes the hang

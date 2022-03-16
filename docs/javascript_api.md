# JavaScript API

You can run Cucumber programmatically via its JavaScript API. This isn't something most users would need to do, but if you have a niche use case or need to work Cucumber into a bigger framework, it might be what you need. The API allows you to load configuration, sources and support code and execute test runs with async functions and within the current process.

The API is available on its own entry point `@cucumber/cucumber/api`.

There are some examples below, and [reference documentation](./api/markdown/index.md) for everything available.

## Simple example

```javascript
import { loadConfiguration, runCucumber } from '@cucumber/cucumber/api'

export async function runTests() {
  const { runnable } = await loadConfiguration()
  const { success } = await runCucumber(runnable)
  return success
}
```

## Complex example

```javascript
import { loadConfiguration, loadSupport, runCucumber } from '@cucumber/cucumber/api'

export async function runTests(directory, configFile, failFast) {
  // things we need to specify about the environment
  const environment = { cwd: directory }
  // load configuration from a particular file, and override a specific option
  const { runnable } = await loadConfiguration({ file: configFile, provided: { failFast } }, environment)
  // load the support code upfront
  const support = await loadSupport(runnable, environment)
  // run cucumber, using the support code we loaded already
  const { success } = await runCucumber({ ...runnable, support }, environment)
  return success
}
```

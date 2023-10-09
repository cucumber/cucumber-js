# Upgrading

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](./CHANGELOG.md).

## 10.0.0

### Configuration files

Configuration files must now be one of our supported extensions (`.json`, `.yaml`, `.yml`, `.cjs`, `.js`, `.mjs`). JavaScript files are now loaded with the appropriate mechanism based on the file extension and package type. If you previously relied on our internal usage of `require()` to dynamically transpile, you'll instead need to transpile beforehand and point Cucumber at the transpiled output.

### Module loading

Custom formatters and snippet syntaxes are now always loaded with `await import()`. If you previously relied on our internal usage of `require()` to dynamically transpile, you'll instead need to transpile beforehand and point Cucumber at the transpiled output.

If no support code is specified with either the `import` or `require` options, we'll now load files from the default paths with `await import()`. If you need the use of `require()` for your setup to work, you'll need to use that option explicitly.

### Attachments in JSON formatter

Previously, string attachments were included as plain text in the JSON formatter output, where other attachments were Base64 encoded. This meant for consumers, it was ambiguous whether any attachment was Base64 encoded or not. Now, all attachments are Base64 encoded regardless of how they were initially attached.

## 9.0.0

### Generator snippet interface

Generator step definitions were removed in `8.0.0`; we've now removed the associated snippet interface too. So if you have some configuration like:

```json
{
  "formatOptions": {
    "snippetInterface": "generator"
  }
}
```

Then you'll need to change that value to one of `synchronous`, `async-await`, `promise` or `callback`.

## 8.0.0

### Generator step definitions

Generator functions used in step definitions (`function*` with the `yield` keyword)
are not natively supported anymore with cucumber-js.

You may consider using `async`/`await` rather than generators.

You can still use generators as before but you need to add your own dependencies
to `bluebird` and `is-generator`. Cucumber-js will no display explicit error message
anymore in case you use a generator without wrapping it properly.

```javascript
const isGenerator = require('is-generator')
const {coroutine} = require('bluebird')
const {setDefinitionFunctionWrapper} = require('@cucumber/cucumber')

setDefinitionFunctionWrapper(function (fn) {
  if (isGenerator.fn(fn)) {
    return coroutine(fn)
  } else {
    return fn
  }
})
```

### Accessing `willBeRetried` from hooks

In the argument passed to your `After` hook function, the `result` no longer has a `willBeRetried` property; this is now available at the top level of the object.

### Using `Cli` programmatically

The `Cli` class is sometimes used to run Cucumber programmatically. We've had to make a few breaking changes:

- `getConfiguration`, `initializeFormatters` and `getSupportCodeLibrary` methods are removed
- The constructor object has two new required properties:
  - `stderr` - writable stream to which we direct warning/error output - you might just pass `process.stderr`
  - `env` - environment variables from which we detect some configuration options - you might just pass `process.env`

In general for programmatic running (including those removed methods) we'd advise switching to [the new API](docs/javascript_api.md) which is designed for this purpose.

### Deep requires

Previously, you could `require` anything directly from Cucumber's internals e.g. `require('@cucumber/cucumber/lib/formatter/helpers')`. As part of adding ESM support we've added subpath exports, which restricts where Node.js can resolve modules from within the package. Deep requires are still possible but in a more limited way e.g. no implicit resolving of `/index.js` with the above example. In a future release we'll remove the capability for deep requires entirely, so we'd advise addressing any instances in your code (here's [an example](https://github.com/cucumber/cucumber-js-pretty-formatter/pull/11)). Everything you need should be available via the main entry point, but if something's missing please [raise an issue](https://github.com/cucumber/cucumber-js/issues).

### Formatter and snippet paths

When providing the path to a custom formatter or snippet syntax:

- For relative paths, you now need to ensure it begins with a `.` (this was already the case for custom formatters as of 7.0.0; snippet syntaxes are being changed to match)
- For absolute paths, you now need to provide it as a valid `file://` URL

### CLI options

These CLI options have been removed:

- `--retryTagFilter` - the correct option is `--retry-tag-filter`
- `--predictable-ids` - this was only used for internal testing

## 7.0.0

### Package Name

Cucumber is now published at `@cucumber/cucumber` instead of `cucumber`. To upgrade, you'll need to remove the old package and add the new one:

```shell
$ npm rm cucumber
$ npm install --save-dev @cucumber/cucumber
```

You'll need to update any `import`/`require` statements in your support code to use the new package name.

(The executable is still `cucumber-js` though.)

### Hooks

The result object passed as the argument to your `After` hook function has a different structure.

Previously in `cucumber`:

```js
{
  "sourceLocation": {
    "uri": "features/example.feature",
    "line": 7
  },
  "pickle": {...},
  "result": {
    "duration": 660000000,
    "status": "failed",
    "exception": {
      "name": "AssertionError",
      "message": "...",
      "showDiff": false,
      "stack": "..."
    },
    "retried": true
  }
}
```

Now in `@cucumber/cucumber`:

```js
{
  "gherkinDocument": {...}, // schema: https://github.com/cucumber/common/blob/messages/v16.0.1/messages/jsonschema/GherkinDocument.json
  "pickle": {...}, // schema: https://github.com/cucumber/common/blob/messages/v16.0.1/messages/jsonschema/Pickle.json
  "testCaseStartedId": "[uuid]",
  "result": {
    "status": "FAILED", // one of: UNKNOWN, PASSED, SKIPPED, PENDING, UNDEFINED, AMBIGUOUS, FAILED
    "message": "...", // includes stack trace
    "duration": {
      "seconds": "0",
      "nanos": 660000000
    }
  }
}
```

### Formatters

The underlying event/data model for cucumber-js is now [cucumber-messages](https://github.com/cucumber/messages), a shared standard across all official Cucumber implementations. This replaces the old "event protocol".

If you maintain any custom formatters, you'll need to refactor them to work with the new model. The basics of a `Formatter` class are the same, and the `EventDataCollector` is still there to help you with tracking down data, but the names of events and shape of their data is different. It's worth checking out the implementations of the built-in formatters if you need a pointer.

We now support referring to custom formatters on the path by module/package name, for example:

```shell
$ cucumber-js --format @cucumber/pretty-formatter
```

This does mean that if you want to point to a local formatter implementation (i.e. not a Node module) then you should ensure it's a relative path starting with `./`.

### Parallel

The parallel mode previously used problematic "master"/"slave" naming that we've dropped in favour of "coordinator" and "worker". This is mostly an internal detail, but is also reflected in the names of some environment variables you might be using:

* `CUCUMBER_TOTAL_SLAVES` is now `CUCUMBER_TOTAL_WORKERS`
* `CUCUMBER_SLAVE_ID` is now `CUCUMBER_WORKER_ID`

### TypeScript

*(You can skip this part if you don't use TypeScript in your projects.)*

Where before we relied on the community-authored `@types/cucumber` package, Cucumber is now built with TypeScript and as such includes its own typings, so you can drop your dependency on the separate package:

```shell
$ npm rm @types/cucumber
```

There are a few minor differences to be aware of:

- The type for data tables was named `TableDefinition` - it's now named `DataTable`
- `World` was typed as an interface, but it's actually a class - you should `extend` it when [building a custom formatter](docs/custom_formatters.md)

Also, your `tsconfig.json` should have the `resolveJsonModule` compiler option switched on. Other than that, a pretty standard TypeScript setup should work as expected.

### Timeouts

You can no longer call `setDefaultTimeout` from within other support code e.g. a step, hook or your World class; it should be called globally.

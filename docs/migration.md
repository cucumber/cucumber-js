# Migrating to cucumber-js 8.x.x

## Generator step definitions

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

# Migrating to cucumber-js 7.x.x

## Package Name

cucumber-js is now published at `@cucumber/cucumber` instead of `cucumber`. To upgrade, you'll need to remove the old package and add the new one:

```shell
$ npm rm cucumber
$ npm install --save-dev @cucumber/cucumber
```

You'll need to update any `import`/`require` statements in your support code to use the new package name.

(The executable is still `cucumber-js` though.)

## Hooks

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

## Formatters

The underlying event/data model for cucumber-js is now [cucumber-messages](https://github.com/cucumber/cucumber/tree/master/messages), a shared standard across all official Cucumber implementations. This replaces the old "event protocol".

If you maintain any custom formatters, you'll need to refactor them to work with the new model. The basics of a `Formatter` class are the same, and the `EventDataCollector` is still there to help you with tracking down data, but the names of events and shape of their data is different. It's worth checking out the implementations of the built-in formatters if you need a pointer.

We now support referring to custom formatters on the path by module/package name, for example:

```shell
$ cucumber-js --format @cucumber/pretty-formatter
```

This does mean that if you want to point to a local formatter implementation (i.e. not a Node module) then you should ensure it's a relative path starting with `./`.

## Parallel

The parallel mode previously used problematic "master"/"slave" naming that we've dropped in favour of "coordinator" and "worker". This is mostly an internal detail, but is also reflected in the names of some environment variables you might be using:

* `CUCUMBER_TOTAL_SLAVES` is now `CUCUMBER_TOTAL_WORKERS`
* `CUCUMBER_SLAVE_ID` is now `CUCUMBER_WORKER_ID`

## TypeScript

*(You can skip this part if you don't use TypeScript in your projects.)*

Where before we relied on the community-authored `@types/cucumber` package, cucumber-js is now built with TypeScript and as such includes its own typings, so you can drop your dependency on the separate package:

```shell
$ npm rm @types/cucumber
```

There are a few minor differences to be aware of:

- The type for data tables was named `TableDefinition` - it's now named `DataTable`
- `World` was typed as an interface, but it's actually a class - you should `extend` it when [building a custom formatter](./custom_formatters.md)

Also, your `tsconfig.json` should have the `resolveJsonModule` compiler option switched on. Other than that, a pretty standard TypeScript setup should work as expected.

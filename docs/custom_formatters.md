# Custom Formatters

You can write your own formatter to get exactly the kind of report you want.

## Writing a formatter

A formatter is a slimmed-down kind of [Plugin](./plugins.md), sharing much of the same lifecycle and plumbing with them.

A formatter in its simplest form is an object identifying itself as a formatter plugin, with a "formatter" function to be run. It should be the default export of your formatter package or module. Here's a minimal formatter skeleton:

```js
export default {
  type: 'formatter',
  formatter: (context) => {
    // do stuff here
  }
}
```

(That example is an ES Module, but CommonJS works just as well.)

### Lifecycle

See [Plugins → Lifecycle](./plugins.md#lifecycle).

Cucumber manages the lifecycle of the stream, and will not finish it until your cleanup function has returned or settled.

### Context

A formatter plugin function accepts a single argument which provides the context for your formatter. It has:

- `on(event: 'message', handler: (envelope: Envelope) => void)` - function for registering an [message handler](#messages)
- `options` - options provided by the user in their configuration
- `logger` - a minimal logger, directed to `stderr`
- `write(buffer: string | Uint8Array)` - fire-and-forget function to write data to the output stream
- `stream` - writable stream the output is being written to (ideally you should use this only for feature detection and/or advanced TTY functionality; for just writing output, use `write`)

### Messages

You can register a handler for Cucumber Messages via the `on` function.

Here's a minimal example that prints the overall result when the test run finishes:

```js
export default {
  type: 'formatter',
  formatter: ({
    on,
    write
  }) => {
    on('message', envelope => {
      if (envelope.testRunFinished) {
        write(envelope.testRunFinished.success ? 'Success' : 'Failure')
      }
    })
  }
}
```

If you're new to Cucumber Messages, we have some resources and tools to help you work with them:

- https://github.com/cucumber/messages includes the original rationale, full schema documentation, relationship diagrams and more
- https://github.com/cucumber/compatibility-kit includes samples of messages for a variety of synthetic test runs - these are mostly for validating Cucumber's own conformance to the schema, but they're also great as test fixtures when building a formatter
- https://github.com/cucumber/query is a library for querying messages that you'll find invaluable for any non-trivial formatter

### Options

Users provide a single `formatOptions` object to Cucumber via their configuration. If you want to target a specific key within this object, you can do that with the `optionsKey` prop on your formatter object, and Cucumber will only give you that block:

```js
export default {
  type: 'formatter',
  formatter: ({ options, on, logger }) => {
    on('message', (message) => {
      if (message.testRunFinished) {
        logger.info(options.bar) // yields `2` if the options are `{foo: {bar: 2}}`
      }
    })
  },
  optionsKey: 'foo'
}
```

### Logging

See [Plugins → Logging](./plugins.md#logging).

### Error handling

See [Plugins → Error Handling](./plugins.md#error-handling).

### TypeScript

If you're using TypeScript, you can get full type checking and completion using the `FormatterPlugin` type:

```ts
import type { FormatterPlugin } from '@cucumber/cucumber/api'

type MyFormatterOptions = {
  foo: {
    bar: number
  }
}

const myFormatter: FormatterPlugin<MyFormatterOptions> = {
  type: 'formatter',
  formatter: (context) => {...},
  optionsKey: 'foo'
}

export default myFormatter
```

## Distribution

If you want to share your formatter with other users, [publish it as an npm package](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) and make sure your formatter plugin object is the default export of the entry point defined in `package.json` - that way users will be able to just reference it by the package name when running cucumber-js, once they've added it as a dependency.

## Legacy architecture

The previous generation of formatter architecture is still supported (see [the previous version of this doc](https://github.com/cucumber/cucumber-js/blob/release/v12.8.1/docs/custom_formatters.md)), though we'd recommend switching to the new architecture and Cucumber Messages.
# Plugins

ℹ️ Added in v12.5.0

Cucumber's functionality can be extended with plugins.

## Using plugins

You can specify one or more plugins via the `plugin` configuration option:

- In a configuration file `{ plugin: ['@my-org/some-plugin', '@my-org/other-plugin'] }`
- On the CLI `cucumber-js --plugin @my-org/some-plugin --plugin @my-org/other-plugin"`

The above examples make sense if you're using a plugin installed from a package registry like npm. If you have a custom plugin (see below) that's local to your project, the specifier might be something like `./my-plugin.js`. 

You can also specify options as JSON, if a plugin needs them:

- In a configuration file `{ pluginOptions: { someOption: true } }`
- On the CLI `cucumber-js --plugin-options '{"someOption":true}'`

## Writing a plugin

You can write your own plugins. They allow you to:

- Listen to Cucumber's message stream
- Hook into core behaviour and change things
- Output extra information for the user

The guide below should help you get a skeletal plugin up and running, and you can find full API and type documentation at:  
<https://cucumber.github.io/cucumber-js/modules/api.html>

Also, some of Cucumber's built-in functionality is implemented as plugins, which you might find useful for examples:

- [Filtering](../src/filter/filter_plugin.ts)
- [Publishing](../src/publish/publish_plugin.ts)
- [Sharding](../src/sharding/sharding_plugin.ts)

A plugin in its simplest form is an object identifying itself as a plugin, with a "coordinator" function to be run. It should be the default export of your plugin package or module. Here's a minimal plugin skeleton:

```js
export default {
  type: 'plugin',
  coordinator: (context) => {
    // do stuff here
  }
}
```

(That example is an ES Module, but CommonJS works just as well.)

### Lifecycle

Your plugin is initialised early in Cucumber's lifecycle, just after we have resolved the configuration. You can do async setup work in your plugin function.

Your plugin is stopped after the test run finishes, just before Cucumber exits. If you need to do cleanup work, your plugin function can return a cleanup function - it will be executed before Cucumber exits, and again can be async.

Here's a rough example:

```js
export default {
  type: 'plugin',
  coordinator: async (context) => {
    // this runs at the start
    await doSomeAsyncSetup()
    return async () => {
      // this runs at the end
      await doSomeAsyncTeardown()
    }
  }
}
```

### Context

A plugin function accepts a single argument which provides the context for your plugin. It has:

- `operation` - the Cucumber operation being run
- `on(event: string, handler: Function)` - function for registering an [event handler](#events)
- `transform(event: string, handler: Function)` - function for registering a [transform](#transforms)
- `options` - options provided by the user in their configuration
- `logger` - a minimal logger, directed to `stderr`
- `environment` - attributes of the current environment

### Events

You can register passive event handlers for these things that happen in Cucumber:

- `message` - emitted for each [Cucumber Message](https://github.com/cucumber/messages) during the process. These are most commonly consumed by [Formatters](./formatters.md), but have other uses too.
- `paths:resolve` - emitted when Cucumber has resolved the paths on the file system from which it will load feature files and support code.

Here's an example emitting a log when the test run finishes:

```js
export default {
  type: 'plugin',
  coordinator: ({
    on,
    logger
  }) => {
    on('message', envelope => {
      if (envelope.testRunFinished) {
        logger.info('Test run finished!')
      }
    })
  }
}
```

### Transforms

You can register transforms for some things that happen in Cucumber in order to modify or augment the built-in behaviour. Your transformer function can be async and should treat the input value as immutable, returning a new value that reflects your modifications.

These are the operations for which you can register transforms:

- `pickles:filter` - called when Cucumber has compiled Pickles for all found Scenarios, and now needs to determine which ones should be run as test cases. Return a new array after doing your filtering.
- `pickles:order` - called after Cucumber has filtered Pickles, so it can sort them. This works the same as the one above.

Here's an example filtering off some unwanted Pickles:

```js
export default {
  type: 'plugin',
  coordinator: ({
    on,
    logger
  }) => {
    transform('pickles:filter', pickles => {
      return pickles.filter(({pickle}) => !pickle.name.includes('widgets'))
    })
  }
}
```

### Options

Users provide a single `pluginOptions` object to Cucumber via their configuration. If you want to target a specific key within this object, you can do that with the `optionsKey` prop on your plugin object, and Cucumber will only give you that block:

```js
export default {
  type: 'plugin',
  coordinator: ({ options, on, logger }) => {
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

The `logger` in your context object can be used to direct user-facing messages to `stderr`. Use it sparingly - users don't enjoy a lot of noise in their terminal. If it's for diagnostics or troubleshooting, consider using the `debug` method, so it's [opt-in for users](./debugging.md).

### Error handling

If your plugin throws an error during its initialisation, cleanup, event handlers or transforms, Cucumber will wrap it with some contextual metadata but otherwise allow it to bubble and cause the test run to fail and exit with a non-zero code. If something your plugin does could yield an error that doesn't constitute a total failure, you should catch and handle it inside of your plugin.

### TypeScript

If you're using TypeScript, you can get full type checking and completion, including for event handlers, transforms and options, using the `Plugin` type:

```ts
import type { Plugin } from '@cucumber/cucumber/api'

type MyPluginOptions = {
  foo: {
    bar: number
  }
}

export default myPlugin: Plugin<MyOptions> = {
  type: 'plugin',
  coordinator: (context) => {...},
  optionsKey: 'foo'
}
```

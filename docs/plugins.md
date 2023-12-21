🚨 This functionality is a work in progress and not yet available in a released version of Cucumber. If you have any
feedback about how plugins are going to work, please jump into the comments
on <https://github.com/cucumber/cucumber-js/discussions/2091> 🚨

- - -

# Plugins

You can extend Cucumber's functionality by writing plugins. They allow you to:

- Listen to Cucumber's message stream
- Hook into core behaviour and change things
- Output extra information for the user

The API is described below. Our own Publish functionality is [implemented as a plugin](../src/publish/publish_plugin.ts), which you might find useful as an example.

## Writing a plugin

A plugin in its simplest form is a function. It should be the default export of your plugin package. Here's the signature:

```js
export default async({
  on,
  logger,
  configuration,
  environment
}) => {
  // do stuff here
}
```

### Lifecycle

Your plugin is initialised early in Cucumber's lifecycle, just after we have resolved the configuration. You can do async setup work in your plugin function - Cucumber will await the promise.

Your plugin is stopped after the test run finishes, just before Cucumber exits. If you need to do cleanup work, your plugin function can return a cleanup function - it will be executed (and awaited if it returns a promise) before Cucumber exits.

A plugin function accepts a single argument which provides the context for your plugin. It has:

- `on(event: string, handler: Function)` - function for registering handlers for events (see below for supported events) - you can call this as many times as you'd like
- `logger` - a console instance that directs output to stderr (or other appropriate stream)
- `configuration` - the final resolved configuration object being used for this execution of Cucumber
- `environment` - details of the environment for this execution of Cucumber

### Events

These are the events for which you can register handlers:

| Name      | Signature                     | Notes                                                                                                                                                                                                                                              |
|-----------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `message` | `(message: Envelope) => void` | Cucumber emits a message for all significant events over the course of a test run. These are most commonly consumed by formatters, but have other uses too. Note that you can do async work in this handler, but Cucumber won't await the promise. |











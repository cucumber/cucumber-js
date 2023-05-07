# Installation

With [npm](https://www.npmjs.com/):

```shell
$ npm install @cucumber/cucumber
```

With [Yarn](https://yarnpkg.com/):

```shell
$ yarn add @cucumber/cucumber
```

## Invalid installations

If Cucumber exits with an error message like:

```
You're calling functions (e.g. "Given") on an instance of Cucumber that isn't running.
This means you have an invalid installation, mostly likely due to:
...
```

This means you have an invalid installation.

Unlike many libraries, Cucumber is _stateful_; you call functions to register your support code, and we keep that state until it's used in the test run. Therefore, it's important that everything interacting with Cucumber in your project is interacting with the same instance. There are a few ways this can go wrong:

### Global installation

Some libraries with a command-line interface are designed to be installed globally. Not Cucumber though - for the reasons above, you need to install it as a dependency in your project.

We'll emit a warning when in [debug mode](./debugging.md) if it looks like Cucumber is installed globally.

### Duplicate dependency

If your project depends on `@cucumber/cucumber`, but also has another dependency that _itself_ depends on `@cucumber/cucumber` (maybe at a slightly different version), this can cause the issue with multiple instances in play at the same time. If you're familiar with React, this is a lot like [the "invalid hook call" issue](https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react).

This is common where you have split some of your support code (e.g. step definitions) into a separate package for reuse across multiple projects, or are perhaps using a third-party package intended to work with Cucumber.

You can diagnose this by running `npm why @cucumber/cucumber` in your project. You might see something like:

```
@cucumber/cucumber@8.4.0 dev
node_modules/@cucumber/cucumber
  dev @cucumber/cucumber@"8.4.0" from the root project

@cucumber/cucumber@8.3.0 dev
node_modules/my-shared-steps-library/node_modules/@cucumber/cucumber
  dev @cucumber/cucumber@"8.3.0" from my-shared-steps-library@1.0.0
  node_modules/my-shared-steps-library
    my-shared-steps-library@"1.0.0" from the root project
```

In this case, the fix is to change the library so `@cucumber/cucumber` is a [peer dependency](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#peerdependencies) rather than a regular dependency (it probably also needs to be a dev dependency). This will remove the duplication in the host project. If you don't control the library, consider using [overrides](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides) (npm) or [resolutions](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/) (Yarn) to get it down to a single instance.

### Deprecated package

When looking at the duplicate dependency issue, it's worth checking whether anything in your project is depending on the old, deprecated `cucumber` package. Anything touching Cucumber [should be using](../UPGRADING.md#package-name) the newer `@cucumber/cucumber` package.

### Linking

With the shared library example above, even if you have `@cucumber/cucumber` correctly defined as a peer dependency, you can still hit the issue if you hook up the library locally using `npm link` or `yarn link` when developing or testing.

This is trickier to deal with. If you run `npm link ../my-project/node_modules/@cucumber/cucumber` from the library, this should work around it (assuming `my-project` is your host project's directory, and it's adjacent to your library in the file system).

### Notes

In earlier versions of Cucumber, this issue would present with a more cryptic error (the causes and solutions are the same):

```
TypeError [ERR_INVALID_ARG_TYPE]: The "from" argument must be of type string. Received type undefined
    at validateString (internal/validators.js:125:11)
    at Object.relative (path.js:1162:5)
    ...
```

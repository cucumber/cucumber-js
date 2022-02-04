# Profiles

If you have several permutations of running Cucumber with different CLI options in your project, it might be a bit cumbersome to manage. *Profiles* enable you to declare bundles of configuration and reference them with a single CLI option. You can use multiple profiles at once and you can still supply options directly on the command line when using profiles.

Profiles are invoked from the command line using the `--profile` option.

```shell
$ cucumber-js --profile my_profile
```

The short tag is `-p`

```shell
$ cucumber-js -p my_profile
```

## Simple Example

Let's take the common case of having some things a bit different locally than on a continuous integration server. Here's the command we've been running locally:

```shell
$ cucumber-js --require-module ts-node/register --require 'support/**/*./ts' --world-parameters '{\"appUrl\":\"http://localhost:3000/\"}' --format progress-bar --format html:./cucumber-report.html
```

For argument's sake, we'll want these changes in CI:

- The URL for the app (maybe dynamically provisioned?)
- The formatters we want to use

To start using Profiles, we just need to create a `cucumber.js` file in our project's root. This file must be a CommonJS module, so when using Cucumber with ES6 modules the file will need to be named `cucumber.cjs`. 

This file is a simple JavaScript module that exports an object with profile names as keys and CLI options as values. We can lean on JavaScript to reduce duplication and grab things dynamically as needed. Here's what we might write to address the needs described above:

```javascript
const worldParameters = {
  appUrl: process.env.MY_APP_URL || "http://localhost:3000/"
}

const common = `--require-module ts-node/register --require 'support/**/*./ts' --world-parameters '${JSON.stringify(worldParameters)}'`

module.exports = {
  'default': `${common} --format progress-bar --format html:./cucumber-report.html`,
  'ci': `${common} --format html:./cucumber-report.html --publish`
}
```

Now, if we just run `cucumber-js` with no arguments, it will pick up our profiles and use the `default` one.  To run the CI profile we will use this command:

```shell
$ cucumber-js -p ci
```

## Using Profiles for Arguments

Cucumber doesn't allow custom command line arguments. For example:

```shell
$ cucumber-js --myArgument
```

The above will result in `error: unknown option '--myArgument'`.

At first glance this can create problems for test suites that need configuration on the fly, particularly web page test suites that need to run the exact same tests against different browser engines and viewport sizes. However, profiles can be used to work around this problem.

The intended method for passing arguments to tests is the `--world-parameters` CLI option, discussed in detail in the section on the [World](./support_files/world.md) object. As this argument expects a JSON literal it can be very tedious to use directly. However, we can use a profile as an alias for each of these options.

Consider the following profile configuration file:

```javascript 
module.exports = {
  desktop: `--world-parameters '{"device": {"type":"desktop","height":720,"width":1280}}'`,
  phone: `--world-parameters '{"device": {"type":"phone","height":568,"width":320}}'`,
  tablet: `--world-parameters '{"device": {"type":"tablet","height":1024,"width":768}}'`,
  chromium: `--world-parameters '{"browser": "chromium"}'`,
  firefox: `--world-parameters '{"browser": "firefox"}'`,
  webkit: `--world-parameters '{"browser": "webkit"}'`
}
```
With it in place we can invoke a test of the iPhone with this command:

```shell
$ cucumber-js -p webkit -p phone
```

The world parameter arguments from the two profile calls will be merged. If you pass profiles that try to set the same parameter, the last one passed in the chain will win out.

## Using another file than `cucumber.js`

Run `cucumber-js` with `--config` - or `-c` - to specify your configuration file if it is something else than the default `cucumber.js`.

```shell
$ cucumber-js --config .cucumber-rc.js
```

**NOTE:** The extension remains controlled by whether your project is configured to use ES6 modules. If it is, you have to use the `cjs` extension.

## Summary
- Profiles are used to group common cli arguments together for easy reuse.
- They can also be used to create world-parameter options rather than trying to use a JSON literal on the command line.
- The `--profile` or `-p` CLI option is repeatable, so you can apply multiple profiles at once.
- You can still supply options directly on the command line when using profiles, they will be appended to whatever comes from profiles.

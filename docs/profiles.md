# Profiles

If you have several permutations of running Cucumber with different CLI options in your project, it might be a bit cumbersome to manage. *Profiles* enable you to declare bundles of configuration and reference them with a single CLI option.

Let's take the common case of having some things a bit different locally vs in CI. Here's the command we've been running locally:

```shell
$ cucumber-js --require-module ts-node/register --require 'support/**/*./ts' --world-parameters '{\"appUrl\":\"http://localhost:3000/\"}' --format progress-bar --format html:./cucumber-report.html
```

For argument's sake, we'll want these changes in CI:

- The URL for the app (maybe dynamically provisioned?)
- The formatters we want to use

To start using Profiles, we just need to create a `cucumber.js` file in our project's root. It's a simple JavaScript module that exports an object with profile names as keys and CLI options as values. We can lean on JavaScript to reduce duplication and grab things dynamically as needed. Here's what we might write to address the needs described above:

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

Now, if we just run `cucumber-js` with no arguments, it will pick up our profiles and use the `default` one.

In CI, we just need to change the command to specify the "ci" profile:

```shell
$ cucumber-js --profile ci
```

Some notes about how Profiles work:

- The `--profile` CLI option is repeatable, so you can apply multiple profiles at once.
- You can still supply options directly on the command line when using profiles, they will be appended to whatever comes from profiles.

## Using another file than `cucumber.js`

Run `cucumber-js` with `--config` - or `-c` - to specify your configuration file
if it is something else than the default `cucumber.js`.

```shell
$ cucumber-js --config .cucumber-rc.js
```

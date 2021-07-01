# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling.

To enable this, run with the `--esm` CLI option.

This will also expand the default glob for support files to include the `.mjs` file extension.

As well as support code, these things can also be in ES modules syntax:

- Custom formatters
- Custom snippets
- Your `cucumber.js` config file

You can use ES modules selectively/incrementally - the module loading strategy that the `--esm` flag activates supports both ES modules and CommonJS.

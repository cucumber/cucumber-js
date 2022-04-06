# Transpiling

Step definitions and support files can be written in syntax/language that compiles to JavaScript, and just-in-time compiled when you run Cucumber.

For example, you might want to use [Babel](https://babeljs.io/):

- In a configuration file `{ requireModule: ['@babel/register'] }`
- On the CLI `$ cucumber-js --require-module @babel/register`

This would mean any support code loaded with the `require` option would be transpiled first.

## TypeScript

Your `tsconfig.json` should have these `compilerOptions` on:

```json
"allowSyntheticDefaultImports": true,
"resolveJsonModule": true,
```

Other than that, a pretty standard TypeScript setup should work as expected.

> ⚠️ Some TypeScript setups use `esnext` modules by default,
>   which doesn't marry well with Node. You may consider using commonjs instead.
>   See how to add [extra configuration](#extra-configuration) below.

You'll also need to specify where your support code is, since `.ts` files won't be picked up by default.

### With ts-node

If you are using [ts-node](https://github.com/TypeStrong/ts-node):

- In a configuration file `{ requireModule: ['ts-node/register'], require: ['step-definitions/**/*.ts'] }`
- On the CLI `$ cucumber-js --require-module ts-node/register --require 'step-definitions/**/*.ts'`

### With Babel

If you are using babel with [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript):

- In a configuration file `{ requireModule: ['@babel/register'], require: ['step-definitions/**/*.ts'] }`
- On the CLI `$ cucumber-js --require-module @babel/register --require 'step-definitions/**/*.ts'`

## Extra Configuration

Sometimes the required module (say `ts-node/register`) needs extra configuration. For example, you might want to configure it such that it prevents the compiled JS being written out to files, and pass some compiler options. In such cases, create a script (say, `tests.setup.js`):

```js
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    "module": "commonjs",
    "resolveJsonModule": true,
  },
});
```

And then require it using the `require` option:

- In a configuration file `{ require: ['tests.setup.js', 'features/**/*.ts'] }`
- On the CLI `$ cucumber-js --require tests.setup.js --require 'features/**/*.ts'`

## ESM

Cucumber doesn't yet support native ESM loader hooks ([see GitHub issue](https://github.com/cucumber/cucumber-js/issues/1844)).

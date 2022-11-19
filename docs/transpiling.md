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

You'll also need to specify where your support code is, since `.ts` files won't be picked up by default.

### With ts-node

If you are using [ts-node](https://github.com/TypeStrong/ts-node):

- In a configuration file `{ requireModule: ['ts-node/register'], require: ['step-definitions/**/*.ts'] }`
- On the CLI `$ cucumber-js --require-module ts-node/register --require 'step-definitions/**/*.ts'`

#### ESM

For ESM projects, you can use `ts-node`'s ESM loader and then `import` your TypeScript files:

```shell
$ NODE_OPTIONS="--loader ts-node/esm" cucumber-js --import 'step-definitions/**/*.ts'
```

Don't forget to set your `tsconfig.json` to emit JavaScript with `import` and `export` statements:

```json
{
  "compilerOptions": {
    "module": "esnext"
  }
}
```

### With Babel

If you are using babel with [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript):

- In a configuration file `{ requireModule: ['@babel/register'], require: ['step-definitions/**/*.ts'] }`
- On the CLI `$ cucumber-js --require-module @babel/register --require 'step-definitions/**/*.ts'`

### ESM

See [ESM](./esm.md) for general advice on using loaders for transpilation in ESM projects.

### Source maps

Source maps are used to ensure accurate source references and stack traces in Cucumber's reporting, by giving traceability from a transpiled piece of code back to the original source code.

Just-in-time transpilers like `ts-node` and `@babel/register` have sensible default configuration that emits source maps and enables them in the runtime environment, so you shouldn't have to do anything in order for source maps to work.

If you're using step definition code that's _already_ transpiled (maybe because it's a shared library) then you'll need to:

1. Ensure source maps are emitted by your transpiler. You can verify by checking for a comment starting with `//# sourceMappingURL=` at the end of your transpiled file(s).
2. Ensure source maps are enabled at runtime. Node.js supports this natively via [the `--enable-source-maps` flag](https://nodejs.org/docs/latest/api/cli.html#--enable-source-maps).

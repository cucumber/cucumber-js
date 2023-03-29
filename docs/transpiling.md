# Transpiling

Step definitions and support files can be written in a syntax or language that compiles to JavaScript, and just-in-time compiled when you run Cucumber. The output of the transpiler must match the module format expected by node, and you must use the correct Cucumber directive to import the code, "import" for esm and "require" for CommonJS.

For example, you might want to use [Babel](https://babeljs.io/):

- In a configuration file `{ requireModule: ['@babel/register'] }`
- On the CLI `$ cucumber-js --require-module @babel/register`

This would mean any support code loaded with the `require` option would be transpiled first then loaded into Cucumber.

## TypeScript

Your `tsconfig.json` should have these `compilerOptions`:

```json
"allowSyntheticDefaultImports": true,
"resolveJsonModule": true,

```

Typescript's output must match Cucumber's expected import, and this is controlled by the "module" option in the `tsconfig.json`.  The default is "CommonJS", but if your project is setup to be an ESM project then Typescript will need to output some generation of ES code to Cucumber. If you aren't sure use "ESNext".

Cucumber doesn't load `*.ts` files by default. The glob pattern `step-definitions/**/*.ts` will load them from the default step definition location.

Other than that, a pretty standard TypeScript setup should work as expected.

### With ts-node

[TS-Node](https://github.com/TypeStrong/ts-node): is the one of the most popular ways to load TypeScript files. 

- In a configuration file `{ requireModule: ['ts-node/register'], require: ['step-definitions/**/*.ts'] }`
- On the CLI `$ cucumber-js --require-module ts-node/register --require 'step-definitions/**/*.ts'`

If you are using ts-node in a CommonJS project then this configuration will work, but if you have an ESM project there are additional steps.

* Set TypeScript to export to an ES format such as "ESNext" using the `ts-config.json` file. 
* Then use `ts-node`'s ESM loader to import your TypeScript. 

That last step requires setting an environment variable. The cleanest way to do this is to include the [cross-env](https://www.npmjs.com/package/cross-env) package with `npm i -D cross-env`. With that package installed make the following change to your npm test script invocation in the package.json file:

```json
{
  "scripts": {
    "test": "cross-env NODE_OPTIONS=\"--loader ts-node/esm\" cucumber-js"
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
3. Ensure you are using the require directive to import CommonJS formatted code and import for ESM formatted code.

##Summary
- Transpiling allows you to convert your step definitions from any language that can compile to JavaScript - most frequently Typescript.
- There are two formats for modules in JavaScript: CommonJS and ESM. You must make sure the transpiler outputs what Cucumber expects to input.

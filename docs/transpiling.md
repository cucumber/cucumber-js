# Transpiling

Step definitions and support files can be written in a syntax or language that compiles (or, "transpiles") to JavaScript, and just-in-time compiled when you run Cucumber. This requires a little extra configuration of Cucumber, so we can use the correct mechanism to compile your code on the fly.

For this doc, we'll take the example of TypeScript since it's so prevalent in the ecosystem. But you'll do similar things if you want to use e.g. Babel or CoffeeScript instead.

For compiling TypeScript on the fly, you should install [ts-node](https://github.com/TypeStrong/ts-node) if it's not already a dependency of your project:

```shell
npm install --save-dev ts-node
```

## Module format

The first thing you need to establish is the JavaScript module format you are compiling to. It'll be either of:

- **CommonJS** produces `require` and `module.exports` in compiled output for `import`s and `export`s respectively in the source. If you aren't sure, there's a good chance it's this one.
- [**ESM**](./esm.md) produces `import` and `export` in compiled output which should more closely match your source. This is newer than CommonJS but gaining adoption quickly as the industry transitions.

With TypeScript, your `tsconfig.json` should provide some clues. Specifically, if `compilerOptions.module` is not specified or `CommonJS`, then you're probably outputting CommonJS, whereas anything starting with `ES` or `Node` indicates ESM. 

## CommonJS

For CommonJS, you need to use the `requireModule` configuration option to register `ts-node`, and then `require` for your TypeScript support code, like this:

- In a configuration file `{ requireModule: ['ts-node/register'], require: ['features/step-definitions/**/*.ts'] }`
- On the CLI `npx cucumber-js --require-module ts-node/register --require 'features/step-definitions/**/*.ts'`

## ESM

There are two ways of doing this depending on your version of Cucumber. Given the transitional state of modules in Node.js, consider them both experimental for now.

### Loader option

ℹ️ Added in v10.6.0

For ESM, you need to use the `loader` configuration option to register `ts-node`, and then `import` for your TypeScript support code, like this:

- In a configuration file `{ loader: ['ts-node/esm'], import: ['features/step-definitions/**/*.ts'] }`
- On the CLI `npx cucumber-js --loader ts-node/esm --import 'features/step-definitions/**/*.ts'`

The value of `loader` will usually be a package/module name, but if you have a loader you've authored locally, you can provide a path that's relative to your project's working directory.

Note that some LTS version streams of Node.js introduced this loaders support fairly recently, and you might need to upgrade to a newer minor version:

- 18.x - you need at least 18.19.0
- 20.x - you need at least 20.6.0

### Environment variable

In versions earlier than v10.6.0 (without the `loader` option), you can still instruct Node.js to register the loader on the process via the `NODE_OPTIONS` environment variable, like this:

`NODE_OPTIONS=\"--loader ts-node/esm\"`

You then just need to specify the `import` option as above for your support code.

(This approach is no longer recommended, and you might see a warning from Node.js telling you so.)

### tsconfig-paths

It's not unusual for people to use some path remapping and [`tsconfig-paths`](https://www.npmjs.com/package/tsconfig-paths) as part of their TypeScript setup. See [this open issue](https://github.com/dividab/tsconfig-paths/issues/243) regarding ESM support in that library.

## Source maps

Source maps are used to ensure accurate source references and stack traces in Cucumber's reporting, by giving traceability from a transpiled piece of code back to the original source code.

Just-in-time transpilers like `ts-node` and `@babel/register` have sensible default configuration that emits source maps and enables them in the runtime environment, so you shouldn't have to do anything in order for source maps to work.

If you're using step definition code that's _already_ transpiled (maybe because it's a shared library) then you'll need to:

1. Ensure source maps are emitted by your transpiler. You can verify by checking for a comment starting with `//# sourceMappingURL=` at the end of your transpiled file(s).
2. Ensure source maps are enabled at runtime. Node.js supports this natively via [the `--enable-source-maps` flag](https://nodejs.org/docs/latest/api/cli.html#--enable-source-maps).

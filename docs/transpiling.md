# Transpiling

Step definitions and support files can be written in a syntax or language that compiles (or, "transpiles") to JavaScript, and just-in-time compiled when you run Cucumber. This requires a little extra configuration of Cucumber, so we can use the correct mechanism to compile your code on the fly.

For this doc, we'll take the example of TypeScript since it's so prevalent in the ecosystem. But you'll do similar things if you want to use e.g. Babel or CoffeeScript instead.

For compiling TypeScript on the fly, we suggest [tsx](https://github.com/privatenumber/tsx). It's fast and works without requiring a `tsconfig.json` to be set up. Install it as a dev dependency:

```shell
npm install --save-dev tsx
```

## Module format

The first thing you need to establish is the JavaScript module format you are compiling to. It'll be either of:

- **CommonJS** produces `require` and `module.exports` in compiled output for `import`s and `export`s respectively in the source. If you aren't sure, there's a good chance it's this one.
- [**ESM**](./esm.md) produces `import` and `export` in compiled output which should more closely match your source. This is newer than CommonJS but gaining adoption quickly as the industry transitions.

Your `package.json` will have the answer in the `type` field - either `module` (for ESM) or `commonjs` (for CommonJS), or CommonJS if omitted. 

## CommonJS

For CommonJS, you need to use the `requireModule` configuration option to register `tsx/cjs`, and then `require` for your TypeScript support code, like this:

- In a configuration file `{ requireModule: ['tsx/cjs'], require: ['features/step-definitions/**/*.ts'] }`
- On the CLI `npx cucumber-js --require-module tsx/cjs --require 'features/step-definitions/**/*.ts'`

## ESM

For ESM, you need to use the `import` configuration option to register `tsx/esm`, and then `import` for your TypeScript support code, in that order, like this:

- In a configuration file `{ import: ['tsx/esm', 'features/step-definitions/**/*.ts'] }`
- On the CLI `npx cucumber-js --import tsx/esm --import 'features/step-definitions/**/*.ts'`

### tsconfig-paths

It's not unusual for people to use some path remapping and [`tsconfig-paths`](https://www.npmjs.com/package/tsconfig-paths) as part of their TypeScript setup. See [this open issue](https://github.com/dividab/tsconfig-paths/issues/243) regarding ESM support in that library.

## Source maps

Source maps are used to ensure accurate source references and stack traces in Cucumber's reporting, by giving traceability from a transpiled piece of code back to the original source code.

Just-in-time transpilers like `tsx`, `ts-node` and `@babel/register` have sensible default configuration that emits source maps and enables them in the runtime environment, so you shouldn't have to do anything in order for source maps to work.

If you're using step definition code that's _already_ transpiled (maybe because it's a shared library) then you'll need to:

1. Ensure source maps are emitted by your transpiler. You can verify by checking for a comment starting with `//# sourceMappingURL=` at the end of your transpiled file(s).
2. Ensure source maps are enabled at runtime. Node.js supports this natively via [the `--enable-source-maps` flag](https://nodejs.org/docs/latest/api/cli.html#--enable-source-maps).

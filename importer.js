/*
Provides the async `import()` function to source code that needs it,
without having it transpiled down to commonjs `require()` by TypeScript.
When we drop Node 10 support, we'll stop transpiling to commonjs and remove this.
 */

module.exports = async (path) => await import(path)

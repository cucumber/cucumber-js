/*
Provides the async `import()` function to source code that needs it,
without having it transpiled down to commonjs `require()` by TypeScript.
 */

const { pathToFileURL } = require('url')

module.exports = {
  legacy: async (descriptor) => await Promise.resolve(require(descriptor)),
  esm: async (descriptor, isFilePath) => {
    if (isFilePath) {
      descriptor = pathToFileURL(descriptor).toString()
    }
    return await import(descriptor)
  },
}

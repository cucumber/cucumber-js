/**
 * Provides the async `import()` function to source code that needs it,
 * without having it transpiled down to commonjs `require()` by TypeScript.
 * See https://github.com/microsoft/TypeScript/issues/43329.
 *
 * @param {any} descriptor - A URL or path for the module to load
 * @return {Promise<any>} Promise that resolves to the loaded module
 */
async function importer(descriptor) {
  return await import(descriptor)
}

module.exports = { importer }

// None of this stuff will work on versions of Node older than v12
const MIN_NODE_VERSION = 'v12'
if (process.version < MIN_NODE_VERSION) {
  throw new Error(
    `Cucumber can't run on this version (${process.version}) of Node. Please upgrade to at least ${MIN_NODE_VERSION}.`
  )
}

/**
 * Provides the async `import()` function to source code that needs it,
 * without having it transpiled down to commonjs `require()` by TypeScript.
 * See https://github.com/microsoft/TypeScript/issues/43329.
 *
 * @param {any} descriptor - A URL or path for the module to load
 * @return {Promise<any>} Promise that resolves to the loaded module
 */
async function importer(descriptor) {
  return await import(descriptor).catch((e) => {
    throw new Error(`Cucumber expected an ES module at '${descriptor}' but found a CommonJS module.
    Either change the file to ES syntax or use the --require directive instead of --import`)
  }) 
}

module.exports = { importer }

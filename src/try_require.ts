/**
 * Provides a try guarded require call that will throw a more detailed error when
 * the ERR_REQUIRE_ESM error code is encountered.
 *
 * @param {string} path File path to require from.
 */
export default function tryRequire(path: string) {
  try {
    return require(path)
  } catch (error) {
    if (error.code === 'ERR_REQUIRE_ESM') {
      throw Error(
        `Cucumber expected a CommonJS module at '${path}' but found an ES module.
      Either change the file to CommonJS syntax or use the --import directive instead of --require.
      
      Original error message: ${error.message}`
      )
    } else {
      throw error
    }
  }
}

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
      Either change the file to CommonJS syntax or use the --import directive instead of --require.`,
        { cause: error }
      )
    } else if (error.code === 'ERR_REQUIRE_ASYNC_MODULE') {
      throw Error(
        `Cucumber expected a CommonJS module or simple ES module at '${path}' but found an async ES module.
      Either change the file so it can be required or use the --import directive instead of --require.`,
        { cause: error }
      )
    } else {
      throw error
    }
  }
}

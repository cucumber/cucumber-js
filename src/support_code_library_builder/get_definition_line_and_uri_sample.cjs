/** @param {() => unknown} fn */
function wrap(fn) {
  return fn()
}

module.exports = { wrap }

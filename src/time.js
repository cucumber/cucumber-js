let previousTimestamp

const methods = {
  beginTiming() {
    previousTimestamp = getTimestamp()
  },
  clearInterval: clearInterval.bind(global),
  clearTimeout: clearTimeout.bind(global),
  Date,
  endTiming() {
    return getTimestamp() - previousTimestamp
  },
  setInterval: setInterval.bind(global),
  setTimeout: setTimeout.bind(global),
}

if (typeof setImmediate !== 'undefined') {
  methods.setImmediate = setImmediate.bind(global)
  methods.clearImmediate = clearImmediate.bind(global)
}

function getTimestamp() {
  return new methods.Date().getTime()
}

export default methods

let fns = []

export default {
  add(fn) {
    fns.push(fn)
  },

  get() {
    return fns
  },

  reset() {
    fns = []
  }
}

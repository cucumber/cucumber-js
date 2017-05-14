let fns = []
const beforeHooks = []
const afterHooks = []
const stepDefinitions = []

export default {
  add(fn) {
    fns.push(fn)
  },

  get() {
    return fns
  },

  reset() {
    fns = []
  },

  addStepDefinition(stepDefinition) {
    stepDefinitions.push(stepDefinition)
  },

  addBeforeHook(hookDefinition) {
    beforeHooks.push(hookDefinition)
  },

  addAfterHook(hookDefinition) {
    afterHooks.push(hookDefinition)
  },

  getStepDefinitions() {
    return stepDefinitions
  },

  getAfterHooks() {
    return afterHooks
  },

  getBeforeHooks() {
    return beforeHooks
  }
}

const { defineParameterType } = require('../lib')

defineParameterType({
  name: 'actor',
  regexp: /[A-Z][a-z]+/,
  transformer: (state, name) => {
    console.log('TRANSFORMER', state, name)
    return state.actors[name]
  },
})

import _ from 'lodash'
import 'regenerator-runtime/runtime'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

function createMock(input) {
  if (_.isArray(input)) {
    input = _.zipObject(input)
  }
  return _.mapValues(input, value => {
    return sinon.stub().returns(value)
  })
}

_.assign(global, {
  chai,
  createMock,
  expect: chai.expect,
  sinon
})

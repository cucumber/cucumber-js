import _ from 'lodash'
import sinon from 'sinon'

export function createMock(input) {
  if (_.isArray(input)) {
    input = _.zipObject(input)
  }
  return _.mapValues(input, value => sinon.stub().returns(value))
}

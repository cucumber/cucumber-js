import PickleFilter from '../pickle_filter'
import Definition from './definition'

export default class TestCaseHookDefinition extends Definition {
  constructor(...data) {
    super(...data)
    this.pickleFilter = new PickleFilter({
      tagExpression: this.options.tags,
    })
  }

  appliesToTestCase({ pickle, uri }) {
    return this.pickleFilter.matches({ pickle, uri })
  }

  getInvalidCodeLengthMessage() {
    return this.buildInvalidCodeLengthMessage('0 or 1', '2')
  }

  getInvocationParameters({ hookParameter }) {
    return [hookParameter]
  }

  getValidCodeLengths() {
    return [0, 1, 2]
  }
}

import PickleFilter from '../pickle_filter'
import StepDefinition from './step_definition'
import { addStatusPredicates } from '../status'

export default class TestCaseHookDefinition extends StepDefinition {
  constructor(data) {
    super(data)
    this.pickleFilter = new PickleFilter({
      tagExpression: this.options.tags
    })
  }

  appliesToTestCase({ pickle, uri }) {
    return this.pickleFilter.matches({ pickle, uri })
  }

  getInvalidCodeLengthMessage() {
    return this.buildInvalidCodeLengthMessage('0 or 1', '2')
  }

  getInvocationParameters({ testCaseResult }) {
    return [addStatusPredicates(testCaseResult)]
  }

  getValidCodeLengths() {
    return [0, 1, 2]
  }
}

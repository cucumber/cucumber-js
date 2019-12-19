import { PickleTagFilter } from '../pickle_filter'
import Definition from './definition'

export default class TestCaseHookDefinition extends Definition {
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data) {
    super(data)
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle) {
    return this.pickleTagFilter.matchesAllTagExpressions(pickle)
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

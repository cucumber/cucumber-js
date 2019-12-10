import { PickleTagFilter } from '../pickle_filter'
import Definition from './definition'
import { messages } from 'cucumber-messages'

export default class TestCaseHookDefinition extends Definition {
  constructor(data) {
    super(data)
    this.pickleTagFilter = new PickleTagFilter(this.options.tags)
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

  toEnvelope() {
    return new messages.Envelope({
      testCaseHookDefinitionConfig: {
        id: this.id,
        location: {
          uri: this.uri,
          location: { line: this.line },
        },
      },
    })
  }
}

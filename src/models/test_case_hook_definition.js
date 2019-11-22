import PickleFilter from '../pickle_filter'
import Definition from './definition'
import uuidv4 from 'uuid/v4'
import { messages } from 'cucumber-messages'

export default class TestCaseHookDefinition extends Definition {
  constructor(...data) {
    super(...data)
    this.id = uuidv4()
    this.pickleFilter = new PickleFilter({
      tagExpression: this.options.tags,
    })
  }

  appliesToTestCase(pickle) {
    return this.pickleFilter.matches(pickle)
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

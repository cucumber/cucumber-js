import Definition from './definition'

export default class TestRunHookDefinition extends Definition {
  getInvalidCodeLengthMessage() {
    return this.buildInvalidCodeLengthMessage('0', '1')
  }

  getInvocationParameters() {
    return []
  }

  getValidCodeLengths() {
    return [0, 1]
  }
}

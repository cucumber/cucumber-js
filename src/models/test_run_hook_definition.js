import StepDefinition from './step_definition'

export default class TestRunHookDefinition extends StepDefinition {
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

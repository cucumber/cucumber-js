import DataTable from './data_table'
import Definition from './definition'
import { messages } from 'cucumber-messages'
import { parseStepArgument } from '../step_arguments'

export default class StepDefinition extends Definition {
  constructor(data) {
    super(data)
    this.pattern = data.pattern
    this.expression = data.expression
  }

  getInvocationParameters({ step, world }) {
    const parameters = this.expression
      .match(step.text)
      .map(arg => arg.getValue(world))
    if (step.argument) {
      const argumentParamater = parseStepArgument(step.argument, {
        dataTable: arg => new DataTable(arg),
        docString: arg => arg.content,
      })
      parameters.push(argumentParamater)
    }
    return parameters
  }

  getValidCodeLengths(parameters) {
    return [parameters.length, parameters.length + 1]
  }

  matchesStepName(stepName) {
    return Boolean(this.expression.match(stepName))
  }

  toEnvelope() {
    return new messages.Envelope({
      stepDefinitionConfig: {
        id: this.id,
        location: {
          uri: this.uri,
          location: { line: this.line },
        },
      },
    })
  }
}

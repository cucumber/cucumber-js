import DataTable from './data_table'
import { buildStepArgumentIterator } from '../step_arguments'
import Definition from './definition'
import { messages } from 'cucumber-messages'

export default class StepDefinition extends Definition {
  constructor(data) {
    super(data)
    this.pattern = data.pattern
    this.expression = data.expression
  }

  getInvocationParameters({ step, world }) {
    const stepNameParameters = this.expression
      .match(step.text)
      .map(arg => arg.getValue(world))
    const stepArgumentParameters = []
    const iterator = buildStepArgumentIterator({
      dataTable: arg => new DataTable(arg),
      docString: arg => arg.content,
    })
    if (step.argument) {
      stepArgumentParameters.push(iterator(step.argument))
    }
    return stepNameParameters.concat(stepArgumentParameters)
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

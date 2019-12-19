import DataTable from './data_table'
import Definition from './definition'
import { parseStepArgument } from '../step_arguments'
import { Expression } from 'cucumber-expressions'

export default class StepDefinition extends Definition {
  public readonly pattern: string
  public readonly expression: Expression

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
}

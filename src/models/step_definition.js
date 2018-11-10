import DataTable from './data_table'
import { buildStepArgumentIterator } from '../step_arguments'
import Definition from './definition'

export default class StepDefinition extends Definition {
  constructor({ code, line, options, uri, pattern, expression }) {
    super({ code, line, options, uri })
    this.pattern = pattern
    this.expression = expression
  }

  getInvocationParameters({ step, world }) {
    const stepNameParameters = this.expression
      .match(step.text)
      .map(arg => arg.getValue(world))
    const iterator = buildStepArgumentIterator({
      dataTable: arg => new DataTable(arg),
      docString: arg => arg.content,
    })
    const stepArgumentParameters = step.arguments.map(iterator)
    return stepNameParameters.concat(stepArgumentParameters)
  }

  getValidCodeLengths(parameters) {
    return [parameters.length, parameters.length + 1]
  }

  matchesStepName(stepName) {
    return Boolean(this.expression.match(stepName))
  }
}

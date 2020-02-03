import DataTable from './data_table'
import Definition, {
  IDefinition,
  IGetInvocationDataRequest,
  IGetInvocationDataResponse,
  IStepDefinitionParameters,
} from './definition'
import { parseStepArgument } from '../step_arguments'
import { Expression } from 'cucumber-expressions'
import bluebird from 'bluebird'
import { doesHaveValue } from '../value_checker'

export default class StepDefinition extends Definition implements IDefinition {
  public readonly pattern: string | RegExp
  public readonly expression: Expression

  constructor(data: IStepDefinitionParameters) {
    super(data)
    this.pattern = data.pattern
    this.expression = data.expression
  }

  async getInvocationParameters({
    step,
    world,
  }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    const parameters = await bluebird.all(
      this.expression.match(step.text).map(arg => arg.getValue(world))
    )
    if (doesHaveValue(step.argument)) {
      const argumentParamater = parseStepArgument<any>(step.argument, {
        dataTable: arg => new DataTable(arg),
        docString: arg => arg.content,
      })
      parameters.push(argumentParamater)
    }
    return {
      getInvalidCodeLengthMessage: () =>
        this.baseGetInvalidCodeLengthMessage(parameters),
      parameters,
      validCodeLengths: [parameters.length, parameters.length + 1],
    }
  }

  matchesStepName(stepName: string): boolean {
    return doesHaveValue(this.expression.match(stepName))
  }
}

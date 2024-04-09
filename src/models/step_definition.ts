import { Expression } from '@cucumber/cucumber-expressions'
import { parseStepArgument } from '../step_arguments'
import { doesHaveValue } from '../value_checker'
import DataTable from './data_table'
import Definition, {
  IDefinition,
  IGetInvocationDataRequest,
  IGetInvocationDataResponse,
  IStepDefinitionParameters,
} from './definition'
import { GherkinStepKeyword } from './gherkin_step_keyword'

export default class StepDefinition extends Definition implements IDefinition {
  public readonly keyword: GherkinStepKeyword
  public readonly pattern: string | RegExp
  public readonly expression: Expression

  constructor(data: IStepDefinitionParameters) {
    super(data)
    this.keyword = data.keyword
    this.pattern = data.pattern
    this.expression = data.expression
  }

  async getInvocationParameters({
    step,
    world,
  }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    const parameters = await Promise.all(
      this.expression.match(step.text).map((arg) => arg.getValue(world))
    )
    if (doesHaveValue(step.argument)) {
      const argumentParameter = parseStepArgument<any>(step.argument, {
        dataTable: (arg) => new DataTable(arg),
        docString: (arg) => arg.content,
      })
      parameters.push(argumentParameter)
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

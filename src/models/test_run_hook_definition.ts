import Definition, {
  IDefinitionParameters,
  IDefinitionOptions,
} from './definition'

export interface ITestRunHookDefinitionOptions extends IDefinitionOptions {
  name?: string
}

export default class TestRunHookDefinition extends Definition {
  public readonly name: string

  constructor(data: IDefinitionParameters<ITestRunHookDefinitionOptions>) {
    super(data)
    this.name = data.options.name
  }
}

import { HookTarget } from '../support_code_library_builder/types'
import Definition, { type IDefinitionOptions, type IDefinitionParameters } from './definition'

export interface ITestRunHookDefinitionOptions extends IDefinitionOptions {
  name?: string
  on?: HookTarget
}

export default class TestRunHookDefinition extends Definition {
  public readonly name: string
  public readonly on: HookTarget

  constructor(data: IDefinitionParameters<ITestRunHookDefinitionOptions>) {
    super(data)
    this.name = data.options.name
    this.on = data.options.on ?? HookTarget.WORKER
  }
}

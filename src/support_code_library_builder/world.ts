import cloneDeep from 'lodash.clonedeep'
import { ICreateAttachment, ICreateLog } from '../runtime/attachment_manager'

export type TestRunContext = any

export interface IWorldOptions<ParametersType = any> {
  attach: ICreateAttachment
  log: ICreateLog
  parameters: ParametersType
  testRunContext: TestRunContext
}

export interface IWorld<ParametersType = any> {
  readonly attach: ICreateAttachment
  readonly log: ICreateLog
  readonly parameters: ParametersType
  readonly testRunContext: TestRunContext
  [key: string]: any
}

export default class World<ParametersType = any>
  implements IWorld<ParametersType>
{
  public readonly attach: ICreateAttachment
  public readonly log: ICreateLog
  public readonly parameters: ParametersType
  public readonly testRunContext: TestRunContext

  constructor({
    attach,
    log,
    parameters,
    testRunContext,
  }: IWorldOptions<ParametersType>) {
    this.attach = attach
    this.log = log
    this.parameters = parameters
    this.testRunContext = cloneDeep(testRunContext)
  }
}

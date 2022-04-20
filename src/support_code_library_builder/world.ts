import { ICreateAttachment, ICreateLog } from '../runtime/attachment_manager'

export type TestRunContext = any

export interface IWorldOptions {
  attach: ICreateAttachment
  log: ICreateLog
  parameters: any
  testRunContext: TestRunContext
}

export interface IWorld {
  readonly attach: ICreateAttachment
  readonly log: ICreateLog
  readonly parameters: any
  readonly testRunContext: TestRunContext
  [key: string]: any
}

export default class World implements IWorld {
  public readonly attach: ICreateAttachment
  public readonly log: ICreateLog
  public readonly parameters: any
  public readonly testRunContext: TestRunContext

  constructor({ attach, log, parameters, testRunContext }: IWorldOptions) {
    this.attach = attach
    this.log = log
    this.parameters = parameters
    this.testRunContext = testRunContext
  }
}

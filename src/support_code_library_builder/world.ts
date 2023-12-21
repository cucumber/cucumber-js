import { ICreateAttachment, ICreateLog } from '../runtime/attachment_manager'

export interface IWorldOptions<ParametersType = any> {
  attach: ICreateAttachment
  log: ICreateLog
  parameters: ParametersType
}

export interface IWorld<ParametersType = any> {
  readonly attach: ICreateAttachment
  readonly log: ICreateLog
  readonly parameters: ParametersType

  [key: string]: any
}

export default class World<ParametersType = any>
  implements IWorld<ParametersType>
{
  public readonly attach: ICreateAttachment
  public readonly log: ICreateLog
  public readonly parameters: ParametersType

  constructor({ attach, log, parameters }: IWorldOptions<ParametersType>) {
    this.attach = attach
    this.log = log
    this.parameters = parameters
  }
}

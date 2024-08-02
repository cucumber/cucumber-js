import {
  ICreateAttachment,
  ICreateLink,
  ICreateLog,
} from '../runtime/attachment_manager'

export interface IWorldOptions<ParametersType = any> {
  attach: ICreateAttachment
  log: ICreateLog
  link: ICreateLink
  parameters: ParametersType
}

export interface IWorld<ParametersType = any> {
  readonly attach: ICreateAttachment
  readonly log: ICreateLog
  readonly link: ICreateLink
  readonly parameters: ParametersType

  [key: string]: any
}

export default class World<ParametersType = any>
  implements IWorld<ParametersType>
{
  public readonly attach: ICreateAttachment
  public readonly log: ICreateLog
  public readonly link: ICreateLink
  public readonly parameters: ParametersType

  constructor({
    attach,
    log,
    link,
    parameters,
  }: IWorldOptions<ParametersType>) {
    this.attach = attach
    this.log = log
    this.link = link
    this.parameters = parameters
  }
}

import type { ICreateAttachment, ICreateLink, ICreateLog } from '../runtime/attachment_manager'

// biome-ignore lint/suspicious/noExplicitAny: world parameters come from user config and really can be anything; users can supply a type argument to narrow
export interface IWorldOptions<ParametersType = any> {
  attach: ICreateAttachment
  log: ICreateLog
  link: ICreateLink
  parameters: ParametersType
}

// biome-ignore lint/suspicious/noExplicitAny: world parameters come from user config and really can be anything; users can supply a type argument to narrow
export interface IWorld<ParametersType = any> {
  readonly attach: ICreateAttachment
  readonly log: ICreateLog
  readonly link: ICreateLink
  readonly parameters: ParametersType

  // biome-ignore lint/suspicious/noExplicitAny: user code attaches arbitrary properties to the world
  [key: string]: any
}

// biome-ignore lint/suspicious/noExplicitAny: world parameters come from user config and really can be anything; users can supply a type argument to narrow
export default class World<ParametersType = any> implements IWorld<ParametersType> {
  public readonly attach: ICreateAttachment
  public readonly log: ICreateLog
  public readonly link: ICreateLink
  public readonly parameters: ParametersType

  constructor({ attach, log, link, parameters }: IWorldOptions<ParametersType>) {
    this.attach = attach
    this.log = log
    this.link = link
    this.parameters = parameters
  }
}

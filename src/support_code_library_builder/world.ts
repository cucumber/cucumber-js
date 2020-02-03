import { IAttachment } from '../runtime/attachment_manager'

export type IAttachFunction = (attachment: IAttachment) => void

export interface IWorldOptions {
  attach: IAttachFunction
  parameters: any
}

export default class World {
  private readonly attach: IAttachFunction
  private readonly parameters: any

  constructor({ attach, parameters }: IWorldOptions) {
    this.attach = attach
    this.parameters = parameters
  }
}

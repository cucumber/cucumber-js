import { ICreateAttachment } from '../runtime/attachment_manager'

export interface IWorldOptions {
  attach: ICreateAttachment
  parameters: any
}

export default class World {
  public readonly attach: ICreateAttachment
  public readonly parameters: any

  constructor({ attach, parameters }: IWorldOptions) {
    this.attach = attach
    this.parameters = parameters
  }
}

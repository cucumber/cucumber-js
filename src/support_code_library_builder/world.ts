import { IAttachFunction } from '../runtime/attachment_manager'

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

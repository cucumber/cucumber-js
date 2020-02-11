import { ICreateAttachment } from '../runtime/attachment_manager'

export default class World {
  public readonly attach: ICreateAttachment
  public readonly parameters: any

  constructor({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters
  }
}

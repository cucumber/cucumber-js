import { IAttachment } from '../runtime/attachment_manager'

export default class World {
  private readonly attach: (attachment: IAttachment) => void
  private readonly parameters: any

  constructor({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters
  }
}

import { CoordinatorAdapter } from './types'
import { IRuntime } from './index'

export class Coordinator implements IRuntime {
  constructor(private adapter: CoordinatorAdapter) {}

  async start(): Promise<boolean> {
    return await this.adapter.start()
  }
}

import { IRuntime } from '..'
import {
  INewCoordinatorOptions,
  MultiProcessCoordinatorAdapter,
} from './multi_process_coordinator_adapter'

export default class Coordinator implements IRuntime {
  private readonly adapter: MultiProcessCoordinatorAdapter

  constructor(options: INewCoordinatorOptions) {
    this.adapter = new MultiProcessCoordinatorAdapter(options)
  }

  start(): Promise<boolean> {
    return this.adapter.start()
  }
}

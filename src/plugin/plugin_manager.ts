import { Envelope } from '@cucumber/messages'
import { Plugin, PluginCleanup } from './types'
import { IRunEnvironment, IRunOptions } from '../api'

export class PluginManager {
  private handlers: Array<(value: Envelope) => void> = []
  private cleanupFns: PluginCleanup[] = []

  constructor(private pluginFns: Plugin[]) {}

  private async register(event: 'message', handler: (value: Envelope) => void) {
    this.handlers.push(handler)
  }

  async init(configuration: IRunOptions, environment: IRunEnvironment) {
    for (const pluginFn of this.pluginFns) {
      const cleanupFn = await pluginFn({
        on: this.register.bind(this),
        configuration,
        environment,
      })
      if (cleanupFn) {
        this.cleanupFns.push(cleanupFn)
      }
    }
  }

  emit(event: 'message', value: Envelope): void {
    this.handlers.forEach((handler) => handler(value))
  }

  async cleanup(): Promise<void> {
    for (const cleanupFn of this.cleanupFns) {
      await cleanupFn()
    }
  }
}

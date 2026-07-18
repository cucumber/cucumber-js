import { Console } from 'node:console'
import type { Writable } from 'node:stream'
import type { ILogger } from './types'

export class ConsoleLogger implements ILogger {
  private readonly console: Console

  constructor(
    private stream: Writable,
    private debugEnabled: boolean
  ) {
    this.console = new Console(this.stream)
  }

  debug(message?: unknown, ...optionalParams: unknown[]): void {
    if (this.debugEnabled) {
      this.console.debug(message, ...optionalParams)
    }
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
    this.console.error(message, ...optionalParams)
  }

  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.console.warn(message, ...optionalParams)
  }

  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.console.info(message, ...optionalParams)
  }
}

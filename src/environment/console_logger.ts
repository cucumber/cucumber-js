import { Console } from 'node:console'
import { Writable } from 'node:stream'
import { ILogger } from './types'

export class ConsoleLogger implements ILogger {
  private readonly console: Console

  constructor(
    private stream: Writable,
    private debugEnabled: boolean
  ) {
    this.console = new Console(this.stream)
  }

  debug(message?: any, ...optionalParams: any[]): void {
    if (this.debugEnabled) {
      this.console.debug(message, ...optionalParams)
    }
  }

  error(message?: any, ...optionalParams: any[]): void {
    this.console.error(message, ...optionalParams)
  }

  warn(message?: any, ...optionalParams: any[]): void {
    this.console.warn(message, ...optionalParams)
  }
}

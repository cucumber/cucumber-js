import { Console } from 'node:console'
import { Writable } from 'node:stream'
import { ILogger } from '../logger'

export class ConsoleLogger implements ILogger {
  private console: Console
  constructor(
    private stream: Writable,
    private debugEnabled: boolean
  ) {
    this.console = new Console(this.stream)
  }

  debug(...content: any[]): void {
    if (this.debugEnabled) {
      this.console.debug(...content)
    }
  }

  error(...content: any[]): void {
    this.console.error(...content)
  }

  warn(...content: any[]): void {
    this.console.warn(...content)
  }
}

import { Console } from 'console'
import { Writable } from 'stream'
import { ILogger } from '../logger'

export class ConsoleLogger implements ILogger {
  private console: Console = new Console(this.stream)
  constructor(private stream: Writable, private debugEnabled: boolean) {}

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

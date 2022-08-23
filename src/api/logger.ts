import { Console } from 'console'
import { Writable } from 'stream'
import { IDebugLogger, ILogger } from '../logger'

class DebugLogger implements IDebugLogger {
  constructor(private console: Console, private debugEnabled: boolean) {}

  log(message: any, ...optionalParams: any[]): void {
    if (this.debugEnabled) {
      this.console.log(message, ...optionalParams)
    }
  }
}

export class Logger implements ILogger {
  private console: Console = new Console(this.stream)
  readonly debug: IDebugLogger = new DebugLogger(
    this.console,
    this.debugEnabled
  )
  constructor(private stream: Writable, private debugEnabled: boolean) {}

  error(message: any, ...optionalParams: any[]): void {
    this.console.error(message, ...optionalParams)
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.console.warn(message, ...optionalParams)
  }
}

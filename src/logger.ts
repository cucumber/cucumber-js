export interface IDebugLogger {
  log: (message?: any, ...optionalParams: any[]) => void
}

export interface ILogger {
  readonly debug: IDebugLogger
  error: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
}

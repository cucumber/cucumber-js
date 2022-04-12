import { IConfiguration } from './types'

export function validateConfiguration(configuration: IConfiguration): void {
  if (configuration.retryTagFilter && !configuration.retry) {
    throw new Error(
      'a positive `retry` count must be specified when setting `retryTagFilter`'
    )
  }
}

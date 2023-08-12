import { IConfiguration } from './types'
import { ILogger } from '../logger'

export function validateConfiguration(
  configuration: IConfiguration,
  logger: ILogger
): void {
  if (configuration.publishQuiet) {
    logger.warn(
      '`publishQuiet` option is no longer needed, you can remove it from your configuration; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
    )
  }
  if (configuration.retryTagFilter && !configuration.retry) {
    throw new Error(
      'a positive `retry` count must be specified when setting `retryTagFilter`'
    )
  }
}

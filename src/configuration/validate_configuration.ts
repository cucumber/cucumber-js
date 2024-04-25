import { ILogger } from '../logger'
import { IConfiguration } from './types'

export function validateConfiguration(
  configuration: IConfiguration,
  logger: ILogger
): void {
  if (configuration.publishQuiet) {
    logger.warn(
      '`publishQuiet` option is no longer needed, you can remove it from your configuration; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
    )
  }
  if (configuration.requireModule.length && !configuration.require.length) {
    logger.warn(
      'Use of `require-module` option normally means you should specify your support code paths with `require`; see https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code'
    )
  }
  if (configuration.loader.length && !configuration.import.length) {
    logger.warn(
      'Use of `loader` option normally means you should specify your support code paths with `import`; see https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code'
    )
  }
  if (configuration.retryTagFilter && !configuration.retry) {
    throw new Error(
      'a positive `retry` count must be specified when setting `retryTagFilter`'
    )
  }
}

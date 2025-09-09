import { ILogger } from '../environment'
import { IConfiguration } from './types'

export function validateConfiguration(
  configuration: IConfiguration,
  logger: ILogger
): void {
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
  if (configuration.shard && !/^\d+\/\d+$/.test(configuration.shard)) {
    throw new Error(
      'the shard option must be in the format <index>/<total> (e.g. 1/3)'
    )
  }
}

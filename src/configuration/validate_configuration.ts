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
  if (configuration.formatOptions.colorsEnabled !== undefined) {
    logger.warn(
      `The 'colorsEnabled' format option is deprecated and will be removed in a future major version. ` +
        `Use the FORCE_COLOR environment variable instead (FORCE_COLOR=1 to enable, FORCE_COLOR=0 to disable); ` +
        `see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md`
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

import {
  IConfiguration,
  isTruthyString,
  splitFormatDescriptor,
} from '../configuration'
import { IPublishConfig } from '../publish'
import { ILogger } from '../logger'
import { IRunConfiguration } from './types'

export async function convertConfiguration(
  logger: ILogger,
  flatConfiguration: IConfiguration,
  env: NodeJS.ProcessEnv
): Promise<IRunConfiguration> {
  return {
    sources: {
      paths: flatConfiguration.paths,
      defaultDialect: flatConfiguration.language,
      names: flatConfiguration.name,
      tagExpression: flatConfiguration.tags,
      order: flatConfiguration.order,
    },
    support: {
      requireModules: flatConfiguration.requireModule,
      requirePaths: flatConfiguration.require,
      importPaths: flatConfiguration.import,
      loaders: flatConfiguration.loader,
    },
    runtime: {
      dryRun: flatConfiguration.dryRun,
      failFast: flatConfiguration.failFast,
      filterStacktraces: !flatConfiguration.backtrace,
      parallel: flatConfiguration.parallel,
      retry: flatConfiguration.retry,
      retryTagFilter: flatConfiguration.retryTagFilter,
      strict: flatConfiguration.strict,
      worldParameters: flatConfiguration.worldParameters,
    },
    formats: convertFormats(logger, flatConfiguration, env),
  }
}

function convertFormats(
  logger: ILogger,
  flatConfiguration: IConfiguration,
  env: NodeJS.ProcessEnv
) {
  const splitFormats: string[][] = flatConfiguration.format.map((item) =>
    Array.isArray(item) ? item : splitFormatDescriptor(logger, item)
  )
  return {
    stdout:
      [...splitFormats].reverse().find(([, target]) => !target)?.[0] ??
      'progress',
    files: splitFormats
      .filter(([, target]) => !!target)
      .reduce((mapped, [type, target]) => {
        return {
          ...mapped,
          [target]: type,
        }
      }, {}),
    publish: makePublishConfig(flatConfiguration, env),
    options: flatConfiguration.formatOptions,
  }
}

function makePublishConfig(
  flatConfiguration: IConfiguration,
  env: NodeJS.ProcessEnv
): IPublishConfig | false {
  const enabled = isPublishing(flatConfiguration, env)
  if (!enabled) {
    return false
  }
  return {
    url: env.CUCUMBER_PUBLISH_URL,
    token: env.CUCUMBER_PUBLISH_TOKEN,
  }
}

function isPublishing(
  flatConfiguration: IConfiguration,
  env: NodeJS.ProcessEnv
): boolean {
  return (
    flatConfiguration.publish ||
    isTruthyString(env.CUCUMBER_PUBLISH_ENABLED) ||
    env.CUCUMBER_PUBLISH_TOKEN !== undefined
  )
}

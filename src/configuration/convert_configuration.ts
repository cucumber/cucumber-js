import { IConfiguration, IRunConfiguration } from './types'
import { OptionSplitter } from './option_splitter'

export async function convertConfiguration(
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
    formats: {
      // TODO it should be the last one found, not the first!
      stdout: flatConfiguration.format.find((option) => !option.includes(':')),
      files: flatConfiguration.format
        .filter((option) => option.includes(':'))
        .reduce((mapped, item) => {
          const [type, target] = OptionSplitter.split(item)
          return {
            ...mapped,
            [target]: type,
          }
        }, {}),
      publish: makePublishConfig(flatConfiguration, env),
      options: flatConfiguration.formatOptions,
    },
  }
}

export function isTruthyString(s: string | undefined): boolean {
  if (s === undefined) {
    return false
  }
  return s.match(/^(false|no|0)$/i) === null
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

function makePublishConfig(
  flatConfiguration: IConfiguration,
  env: NodeJS.ProcessEnv
): any {
  const enabled = isPublishing(flatConfiguration, env)
  if (!enabled) {
    return false
  }
  return {
    url: env.CUCUMBER_PUBLISH_URL,
    token: env.CUCUMBER_PUBLISH_TOKEN,
  }
}

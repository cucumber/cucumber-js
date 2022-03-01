import { IParsedArgv, IParsedArgvOptions } from './argv_parser'
import OptionSplitter from './option_splitter'
import { IRunConfiguration } from '../configuration'

export async function buildConfiguration(
  fromArgv: IParsedArgv,
  env: NodeJS.ProcessEnv
): Promise<IRunConfiguration> {
  const { args, options } = fromArgv
  return {
    sources: {
      paths: args,
      defaultDialect: options.language,
      names: options.name,
      tagExpression: options.tags,
      order: options.order,
    },
    support: {
      requireModules: options.requireModule,
      requirePaths: options.require,
      importPaths: options.import,
    },
    runtime: {
      dryRun: options.dryRun,
      failFast: options.failFast,
      filterStacktraces: !options.backtrace,
      parallel: options.parallel,
      retry: options.retry,
      retryTagFilter: options.retryTagFilter,
      strict: options.strict,
      worldParameters: options.worldParameters,
    },
    formats: {
      stdout: options.format.find((option) => !option.includes(':')),
      files: options.format
        .filter((option) => option.includes(':'))
        .reduce((mapped, item) => {
          const [type, target] = OptionSplitter.split(item)
          return {
            ...mapped,
            [target]: type,
          }
        }, {}),
      publish: makePublishConfig(options, env),
      options: options.formatOptions,
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
  options: IParsedArgvOptions,
  env: NodeJS.ProcessEnv
): boolean {
  return (
    options.publish ||
    isTruthyString(env.CUCUMBER_PUBLISH_ENABLED) ||
    env.CUCUMBER_PUBLISH_TOKEN !== undefined
  )
}

function makePublishConfig(
  options: IParsedArgvOptions,
  env: NodeJS.ProcessEnv
): any {
  const enabled = isPublishing(options, env)
  if (!enabled) {
    return false
  }
  return {
    url: env.CUCUMBER_PUBLISH_URL,
    token: env.CUCUMBER_PUBLISH_TOKEN,
  }
}

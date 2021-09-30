import { IParsedArgv, IParsedArgvOptions } from './argv_parser'
import OptionSplitter from './option_splitter'
import { IRunConfiguration } from '../configuration'

export async function buildConfiguration(
  fromArgv: IParsedArgv,
  env: typeof process.env
): Promise<IRunConfiguration> {
  const { args, options } = fromArgv
  return {
    sources: {
      paths: args,
      defaultDialect: options.language,
    },
    pickles: {
      order: options.order,
      names: options.name,
      tagExpression: options.tags,
    },
    support: {
      transpileWith: options.requireModule,
      paths: options.require,
    },
    runtime: {
      dryRun: options.dryRun,
      failFast: options.failFast,
      filterStacktraces: !options.backtrace,
      parallel: options.parallel > 0 ? { count: options.parallel } : null,
      retry:
        options.retry > 0
          ? {
              count: options.retry,
              tagExpression: options.retryTagFilter,
            }
          : null,
      strict: options.strict,
      worldParameters: options.worldParameters,
    },
    formats: {
      stdout: options.format.find((option) => !option.includes(':')),
      files: new Map(
        options.format
          .filter((option) => option.includes(':'))
          .map((item) => {
            const [type, target] = OptionSplitter.split(item)
            return [target, type]
          })
      ),
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
  env: typeof process.env
): boolean {
  return (
    options.publish ||
    isTruthyString(env.CUCUMBER_PUBLISH_ENABLED) ||
    env.CUCUMBER_PUBLISH_TOKEN !== undefined
  )
}

function makePublishConfig(
  options: IParsedArgvOptions,
  env: typeof process.env
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

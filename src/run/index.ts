import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'

interface IRunCucumberOptions {
  cwd: string
  features: {
    defaultDialect?: string
    paths: string[]
  }
  filters: {
    name?: string[]
    tagExpression?: string
  }
  support:
    | {
        transpileWith?: string[]
        paths: string[]
      }
    | ISupportCodeLibrary
  runtime: {
    dryRun?: boolean
    failFast?: boolean
    filterStacktraces?: boolean
    parallel?: {
      count: number
    }
    retry?: {
      count: number
      tagExpression?: string
    }
    strict: boolean
    worldParameters?: any
  }
  formats: {
    stdout: string
    files: Record<string, string>
    options: IParsedArgvFormatOptions
  }
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}

export async function runCucumber(
  options: IRunCucumberOptions
): Promise<IRunResult> {
  return null
}

const result = await runCucumber({
  cwd: process.cwd(),
  features: {
    paths: ['features/**/*.feature'],
  },
  filters: {
    name: ['Acme'],
    tagExpression: '@interesting',
  },
  support: {
    transpileWith: ['ts-node'],
    paths: ['features/support/**/*.ts'],
  },
  runtime: {
    failFast: true,
    retry: {
      count: 1,
      tagExpression: '@flaky',
    },
    strict: true,
    worldParameters: {
      foo: 'bar',
    },
  },
  formats: {
    stdout: '@cucumber/pretty-formatter',
    files: {
      'report.html': 'html',
      'TEST-cucumber.xml': 'junit',
    },
    options: {
      printAttachments: false,
    },
  },
})

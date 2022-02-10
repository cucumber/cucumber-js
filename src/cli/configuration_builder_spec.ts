import { describe, it } from 'mocha'
import { expect } from 'chai'
import { buildConfiguration } from './configuration_builder'
import ArgvParser from './argv_parser'
const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('buildConfiguration', () => {
  it('should derive correct defaults', async () => {
    const result = await buildConfiguration(ArgvParser.parse([...baseArgv]), {})

    expect(result).to.eql({
      formats: {
        files: {},
        options: {},
        publish: false,
        stdout: undefined,
      },
      runtime: {
        dryRun: false,
        failFast: false,
        filterStacktraces: true,
        parallel: 0,
        retry: 0,
        retryTagFilter: '',
        strict: true,
        worldParameters: {},
      },
      sources: {
        defaultDialect: 'en',
        names: [],
        order: 'defined',
        paths: [],
        tagExpression: '',
      },
      support: {
        paths: [],
        transpileWith: [],
      },
    })
  })

  it('should map formatters', async () => {
    const result = await buildConfiguration(
      ArgvParser.parse([
        ...baseArgv,
        '--format',
        'message',
        '--format',
        'json:./report.json',
        '--format',
        'html:./report.html',
      ]),
      {}
    )

    expect(result.formats).to.eql({
      stdout: 'message',
      files: {
        './report.html': 'html',
        './report.json': 'json',
      },
      publish: false,
      options: {},
    })
  })
})

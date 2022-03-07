import { describe, it } from 'mocha'
import ArgvParser from './argv_parser'
import { expect } from 'chai'
import { convertConfiguration } from './convert_configuration'

const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('convertConfiguration', () => {
  it('should derive correct defaults', async () => {
    const fromArgv = ArgvParser.parse([...baseArgv])
    const result = await convertConfiguration(
      {
        ...fromArgv.options,
        paths: fromArgv.args,
      },
      {}
    )

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
        requireModules: [],
        requirePaths: [],
        importPaths: [],
      },
    })
  })

  it('should map formatters', async () => {
    const fromArgv = ArgvParser.parse([
      ...baseArgv,
      '--format',
      'message',
      '--format',
      'json:./report.json',
      '--format',
      'html:./report.html',
    ])
    const result = await convertConfiguration(
      {
        ...fromArgv.options,
        paths: fromArgv.args,
      },
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

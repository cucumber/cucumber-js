import { describe, it } from 'mocha'
import { expect } from 'chai'
import { convertConfiguration } from './convert_configuration'
import { DEFAULT_CONFIGURATION } from '../configuration'

describe('convertConfiguration', () => {
  it('should convert defaults correctly', async () => {
    const result = await convertConfiguration(DEFAULT_CONFIGURATION, {})

    expect(result).to.eql({
      formats: {
        files: {},
        options: {},
        publish: false,
        stdout: 'progress',
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

  it('should map multiple formatters', async () => {
    const result = await convertConfiguration(
      {
        ...DEFAULT_CONFIGURATION,
        format: [
          'summary',
          'message',
          'json:./report.json',
          'html:./report.html',
        ],
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

  it('should map formatters correctly when file:// urls are involved', async () => {
    const result = await convertConfiguration(
      {
        ...DEFAULT_CONFIGURATION,
        format: [
          'file:///my/fancy/formatter',
          'json:./report.json',
          'html:./report.html',
        ],
      },
      {}
    )

    expect(result.formats).to.eql({
      stdout: 'file:///my/fancy/formatter',
      files: {
        './report.html': 'html',
        './report.json': 'json',
      },
      publish: false,
      options: {},
    })
  })
})

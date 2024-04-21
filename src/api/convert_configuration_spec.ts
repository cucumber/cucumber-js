import { describe, it } from 'mocha'
import { expect } from 'chai'
import { DEFAULT_CONFIGURATION } from '../configuration'
import { FakeLogger } from '../../test/fake_logger'
import { convertConfiguration } from './convert_configuration'
import { IRunConfiguration } from './types'

describe('convertConfiguration', () => {
  it('should convert defaults correctly', async () => {
    const result = await convertConfiguration(
      new FakeLogger(),
      DEFAULT_CONFIGURATION,
      {}
    )

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
        loaders: [],
      },
    } satisfies IRunConfiguration)
  })

  it('should map multiple formatters with string notation', async () => {
    const result = await convertConfiguration(
      new FakeLogger(),
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

  it('should map multiple formatters with array notation', async () => {
    const result = await convertConfiguration(
      new FakeLogger(),
      {
        ...DEFAULT_CONFIGURATION,
        format: [
          ['summary'],
          ['message'],
          ['json', './report.json'],
          ['html', './report.html'],
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
      new FakeLogger(),
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

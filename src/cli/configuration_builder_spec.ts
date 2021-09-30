import { describe, it } from 'mocha'
import { expect } from 'chai'
import { buildConfiguration } from './configuration_builder'
import ArgvParser from './argv_parser'
const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('buildConfiguration', () => {
  it('should map formatters ', async () => {
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
      process.env
    )

    expect(result.formats).to.eql({
      stdout: 'message',
      files: new Map([
        ['./report.html', 'html'],
        ['./report.json', 'json'],
      ]),
      publish: false,
      options: {},
    })
  })
})

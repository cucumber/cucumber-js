import { expect } from 'chai'
import ArgvParser from './argv_parser'

const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('ArgvParser', () => {
  describe('parse', () => {
    it('should produce an empty object when no arguments', () => {
      const { configuration } = ArgvParser.parse(baseArgv)
      expect(configuration).to.deep.eq({})
    })

    it('should handle repeatable arguments', () => {
      const { configuration } = ArgvParser.parse([
        ...baseArgv,
        'features/hello.feature',
        'features/world.feature',
        '--require',
        'hooks/**/*.js',
        '--require',
        'steps/**/*.js',
      ])
      expect(configuration).to.deep.eq({
        paths: ['features/hello.feature', 'features/world.feature'],
        require: ['hooks/**/*.js', 'steps/**/*.js'],
      })
    })

    it('should handle mergeable tag strings', () => {
      const { configuration } = ArgvParser.parse([
        ...baseArgv,
        '--tags',
        '@foo',
        '--tags',
        '@bar',
      ])
      expect(configuration).to.deep.eq({
        tags: '(@foo) and (@bar)',
      })
    })

    it('should handle mergeable json objects', () => {
      const params1 = { foo: 1, bar: { stuff: 3 } }
      const params2 = { foo: 2, bar: { things: 4 } }
      const { configuration } = ArgvParser.parse([
        ...baseArgv,
        '--world-parameters',
        JSON.stringify(params1),
        '--world-parameters',
        JSON.stringify(params2),
      ])
      expect(configuration).to.deep.eq({
        worldParameters: { foo: 2, bar: { stuff: 3, things: 4 } },
      })
    })
  })
})

import { expect } from 'chai'
import ArgvParser from './argv_parser'

const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('ArgvParser', () => {
  describe('parse', () => {
    it('should resolve to an empty object when no arguments', () => {
      const result = ArgvParser.parse(baseArgv)
      expect(result).to.deep.eq({})
    })

    it('should support repeatable arguments', () => {
      const result = ArgvParser.parse([
        ...baseArgv,
        'features/hello.feature',
        'features/world.feature',
        '--require',
        'hooks/**/*.js',
        '--require',
        'steps/**/*.js',
      ])
      expect(result).to.deep.eq({
        paths: ['features/hello.feature'],
        require: ['hooks/**/*.js', 'steps/**/*.js'],
      })
    })
  })
})

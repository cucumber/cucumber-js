import { expect } from 'chai'
import { splitArgv } from './split_argv'

describe('splitArgv', () => {
  const examples: ReadonlyArray<[string, string[]]> = [
    ['', []],
    ['  --dry-run   --fail-fast ', ['--dry-run', '--fail-fast']],
    ['--tags "@foo and not @bar"', ['--tags', '@foo and not @bar']],
    [`--name '^Some thing$'`, ['--name', '^Some thing$']],
    ['--name ""', ['--name', '']],
    ['features/**/*.feature', ['features/**/*.feature']],
    ['--format html:reports/$name.html', ['--format', 'html:reports/$name.html']],
    ['C:\\features\\a.feature', ['C:\\features\\a.feature']],
    ['--tags @foo#bar && x | y', ['--tags', '@foo#bar', '&&', 'x', '|', 'y']],
    ['-f summary:"C:\\tmp\\summary.txt"', ['-f', 'summary:"C:\\tmp\\summary.txt"']],
    [`--name "it's"`, ['--name', "it's"]],
  ]

  for (const [input, expected] of examples) {
    it(`splits ${JSON.stringify(input)}`, () => {
      expect(splitArgv(input)).to.deep.eq(expected)
    })
  }
})

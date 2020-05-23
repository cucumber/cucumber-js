const common = [
  '--require-module ts-node/register',
  '--require features/**/*.ts',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
].join(' ')

const cck = [
  '--require-module',
  'ts-node/register',
  '--predictable-ids',
  '--format',
  'message',
].join(' ')

module.exports = {
  default: common,
  cck,
}

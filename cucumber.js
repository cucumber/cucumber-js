const feature = [
  '--require-module ts-node/register',
  '--require features/**/*.ts',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
  '--format message:messages.ndjson',
].join(' ')

const cck = [
  '--require-module',
  'ts-node/register',
  '--format',
  'message',
].join(' ')

const e2e = [
  'node_modules/@cucumber/compatibility-kit/features/minimal/minimal.feature',
  '--require-module',
  'ts-node/register',
  '--require',
  'compatibility/features/minimal/minimal.ts',
  '--format',
  'message:e2e.ndjson',
].join(' ')

module.exports = {
  default: feature,
  cck,
  e2e,
}

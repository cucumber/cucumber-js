module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require features/**/*.ts',
    `--format progress-bar`,
    '--format rerun:@rerun.txt',
    '--format usage:usage.txt',
    '--format message:messages.ndjson',
    '--format html:html-formatter.html',
    '--retry 2',
    '--retry-tag-filter @flaky',
    '--publish-quiet',
  ].join(' '),
}

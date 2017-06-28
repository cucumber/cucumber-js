#!/usr/bin/env bash

diffs=$(node_modules/.bin/prettier -l "{src,example,features,scripts,test}/**/*.js")
if [ -z "$diffs" ]; then
  exit 0
fi

echo >&2 "Javascript files must be formatted with Prettier. Please run:"
echo >&2 "node_modules/.bin/prettier --write "$diffs""
exit 1

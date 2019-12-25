#!/usr/bin/env bash

set -ex

# Get coverage from unit tests
./node_modules/.bin/nyc --silent ./node_modules/.bin/mocha 'src/**/*_spec.ts'

# Get coverage from feature tests (join with unit test via --no-clean)
yarn build-local
./node_modules/.bin/nyc --silent --no-clean node ./bin/cucumber-js

# Generate a report
nyc report --reporter=lcov
echo "Open 'file://$(pwd)/coverage/lcov-report/index.html' in your browser"

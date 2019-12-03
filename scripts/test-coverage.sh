#!/usr/bin/env bash

set -ex

# Get coverage from unit tests
BABEL_ENV=test_coverage ./node_modules/.bin/nyc --silent ./node_modules/.bin/mocha src

# Get coverage from feature tests (join with unit test via --no-clean)
BABEL_ENV=test_coverage ./node_modules/.bin/babel src -d lib --ignore '**/*_spec.js'
./node_modules/.bin/nyc --silent --no-clean node ./bin/cucumber-js

# Generate a report
nyc report --reporter=lcov
echo "Open 'file://$(pwd)/coverage/lcov-report/index.html' in your browser"

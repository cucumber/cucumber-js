#!/usr/bin/env bash

set -ex

# Get coverage from unit tests
rm -rf .nyc_output_unit
BABEL_ENV=test_coverage ./node_modules/.bin/nyc --silent ./node_modules/.bin/mocha src
mv .nyc_output .nyc_output_unit

# Get coverage from feature tests
rm -rf .nyc_output_feature
BABEL_ENV=test_coverage ./node_modules/.bin/babel src -d lib --ignore '**/*_spec.js'
./node_modules/.bin/nyc --silent node ./bin/cucumber.js
mv .nyc_output .nyc_output_feature

# Join coverage
mkdir .nyc_output
cp -a .nyc_output_unit/* .nyc_output
cp -a .nyc_output_feature/* .nyc_output
nyc report --reporter=lcov
echo "Open 'file://$(pwd)/coverage/lcov-report/index.html' in your browser"

#!/usr/bin/env bash

set -e

# Build example, remove source
yarn build-browser-example
rm example/index.js

# Copy resources
rsync -a dist/ example/

# Publish to gh-pages
cd example
git init
git config user.name "Travis CI"
git config user.email "charles.rudolph@originate.com"
git add .
git commit -m "Deploy to GitHub Pages"
git push -f "https://${GITHUB_AUTH_TOKEN}@github.com/cucumber/cucumber-js.git" master:gh-pages

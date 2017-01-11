#!/usr/bin/env bash

set -e

# Copy resources
rsync -a dist/ example/
mkdir example/ansi-html
cp node_modules/ansi-html/index.js example/ansi-html/index.js

# Publish to gh-pages
cd example
git init
git config user.name "Travis CI"
git config user.email "charles.rudolph@originate.com"
git add .
git commit -m "Deploy to GitHub Pages"
git push -f "https://${GITHUB_AUTH_TOKEN}@github.com/cucumber/cucumber-js.git" master:gh-pages

#!/usr/bin/env bash

set -e

# Build
npm run build-release
rsync -a release/ example/
mkdir -p example/jquery/dist
cp node_modules/jquery/dist/jquery.min.js example/jquery/dist/jquery.min.js
rm example/server.js

# Publish to gh-pages
cd example
git init
git config user.name "Travis CI"
git config user.email "charles.rudolph@originate.com"
git add .
git commit -m "Deploy to GitHub Pages"
git push -f "https://${GITHUB_AUTH_TOKEN}@github.com/cucumber/cucumber-js.git" master:gh-pages

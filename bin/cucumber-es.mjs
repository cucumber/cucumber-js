#!/usr/bin/env node

(async () => {
  const run = await import('../lib/cli/run.js')
  await run.default.default((path) => import(path))
})()

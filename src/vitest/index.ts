import path from 'node:path'
import type { IConfiguration } from '../configuration/types'
import { resolveInclude } from './resolve_include'

export const CUCUMBER_VITEST_CONFIG_ENV = 'CUCUMBER_VITEST_CONFIG'

/**
 * A Vite plugin that runs Gherkin `.feature` files as real Vitest tests.
 *
 * @remarks
 * The whole suite is run once, for real, via cucumber's own unmodified
 * `runCucumber()` - the user's cucumber configuration (`parallel` included)
 * is honored as-is; concurrency across pickles/files is owned by cucumber's
 * own `Coordinator`/`WorkerThreadsAdapter`, not Vitest's pool. Each
 * generated `.feature` module just replays its own slice of the
 * already-computed results (see `./worker.mts` and `./global_setup.mts`).
 *
 * `config` accepts the same options as a `cucumber.js` profile. Final
 * precedence (lowest to highest): config file/profile < `config` passed
 * here < the `CUCUMBER_OPTIONS` env var (parsed as CLI arguments, e.g.
 * `CUCUMBER_OPTIONS='--tags @smoke'`) - see `global_setup.mts`.
 *
 * @remarks
 * `config` can't be passed to `global_setup.mts` the way `transform()`
 * passes `id` (a literal baked into generated code loaded via a virtual
 * module) - `test.globalSetup` entries are resolved by Vitest as plain file
 * paths before a plugin's `resolveId` hook ever sees them (confirmed: a
 * virtual id there fails with "Does the file exist?", joined against the
 * project root like any other relative path), unlike ordinary `import`
 * statements inside already-loaded modules. So it goes through the
 * environment instead, read back in `global_setup.mts`.
 * @public
 */
export function cucumber(config: Partial<IConfiguration> = {}) {
  process.env[CUCUMBER_VITEST_CONFIG_ENV] = JSON.stringify(config)

  const workerModulePath = path.join(__dirname, 'worker.mjs')
  const globalSetupPath = path.join(__dirname, 'global_setup.mjs')

  return {
    name: '@cucumber/cucumber/vitest',
    async config(userConfig: { root?: string }) {
      // Same resolution `global_setup.mts` uses for the real run (config
      // file/profile < `config` here < `CUCUMBER_OPTIONS`), so `test.include`
      // can never drift from what `runCucumber()` will actually execute -
      // no separately-maintained glob, and `.feature.md`/custom `paths` are
      // handled automatically rather than needing to be duplicated here.
      const cwd = userConfig?.root ?? process.cwd()
      const sourcePaths = await resolveInclude(config, cwd)

      return {
        test: {
          include: sourcePaths,
          globalSetup: [globalSetupPath],
          // Cucumber's own `parallel` option (when set) spawns real
          // worker_threads from inside this run - without this, coverage
          // (v8 provider only; no equivalent for istanbul) would not see
          // any code executed in those threads.
          coverage: {
            autoAttachSubprocess: true,
          },
        },
      }
    },
    transform(code: string, id: string): { code: string; map: null } | null {
      if (!id.endsWith('.feature')) {
        return null
      }
      return {
        code: `
import { registerFeatureFile } from ${JSON.stringify(workerModulePath)}
registerFeatureFile({ id: ${JSON.stringify(id)} })
`,
        map: null,
      }
    },
  }
}

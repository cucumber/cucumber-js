import path from "node:path";
import type { Envelope, TestStepResult } from "@cucumber/messages";
import {
  getWorstTestStepResult,
  TestStepResultStatus,
} from "@cucumber/messages";
import type { TestProject } from "vitest/node";
import { runCucumber } from "../api/run_cucumber.js";
import type { IConfiguration } from "../configuration/types.js";
import { resolveRunConfiguration } from "./resolve_configuration.js";

export interface CucumberPickleResult {
  uri: string;
  featureName: string;
  name: string;
  status: string;
  errorMessage?: string;
}

export const CUCUMBER_RESULTS_KEY = "cucumberResults";

// Kept as a literal (not imported from `./index.ts`) to avoid a named
// import of a CJS sibling from this ESM module - see the `.mts` note there.
const CUCUMBER_VITEST_CONFIG_ENV = "CUCUMBER_VITEST_CONFIG";

/**
 * Builds the `globalSetup` function for a given `cucumber(config)` call.
 *
 * @remarks
 * `test.globalSetup` entries are resolved by Vitest as plain file paths
 * before a plugin's `resolveId` hook ever sees them, so unlike `transform()`
 * baking `id` into generated code via a virtual module, `pluginConfig` can't
 * be passed to this factory as a literal - it's threaded through
 * `process.env` from `cucumber()` in `./index.ts` instead (see `setup`
 * below, the actual `globalSetup` export).
 */
function createSetup(pluginConfig: Partial<IConfiguration>) {
  /**
   * Runs cucumber's real, unmodified `runCucumber()` for the whole suite,
   * exactly once, honoring the user's own cucumber configuration as-is
   * (`parallel` included - it's cucumber's own `WorkerThreadsAdapter`/
   * `Coordinator` doing the work here, not Vitest's pool). Results are
   * provided to every test file via Vitest's own `provide`/`inject`
   * mechanism, so each generated `.feature` module can just replay its own
   * slice rather than re-running anything.
   *
   * @remarks
   * Runs once per Vitest process (`--watch` reruns are not yet handled).
   */
  return async function setup(project: TestProject): Promise<void> {
    // `process.cwd()` is the real OS working directory the command was
    // invoked from, which is not necessarily Vitest's own configured root
    // (e.g. `vitest --root some/dir` from a different cwd) - both calls
    // below default to `process.cwd()` internally unless told otherwise, so
    // it must be passed explicitly or cucumber resolves paths/support code
    // against the wrong directory.
    const cwd = project.config.root;
    const runConfiguration = await resolveRunConfiguration(pluginConfig, cwd);

    const featureNameByUri = new Map<string, string>();
    const pickleByPickleId = new Map<string, { uri: string; name: string }>();
    const pickleIdByTestCaseId = new Map<string, string>();
    const pickleIdByTestCaseStartedId = new Map<string, string>();
    const stepResultByTestCaseStartedId = new Map<string, TestStepResult>();
    const results: CucumberPickleResult[] = [];

    await runCucumber(runConfiguration, { cwd }, (envelope: Envelope) => {
      if (envelope.gherkinDocument) {
        const uri = path.resolve(cwd, envelope.gherkinDocument.uri ?? "");
        featureNameByUri.set(
          uri,
          envelope.gherkinDocument.feature?.name ?? uri,
        );
      }
      if (envelope.pickle) {
        pickleByPickleId.set(envelope.pickle.id, {
          uri: path.resolve(cwd, envelope.pickle.uri),
          name: envelope.pickle.name,
        });
      }
      if (envelope.testCase) {
        pickleIdByTestCaseId.set(
          envelope.testCase.id,
          envelope.testCase.pickleId,
        );
      }
      if (envelope.testCaseStarted) {
        const pickleId = pickleIdByTestCaseId.get(
          envelope.testCaseStarted.testCaseId,
        );
        if (pickleId) {
          pickleIdByTestCaseStartedId.set(
            envelope.testCaseStarted.id,
            pickleId,
          );
        }
      }
      if (envelope.testStepFinished) {
        const key = envelope.testStepFinished.testCaseStartedId;
        const incoming = envelope.testStepFinished.testStepResult;
        const existing = stepResultByTestCaseStartedId.get(key);
        stepResultByTestCaseStartedId.set(
          key,
          existing ? getWorstTestStepResult([existing, incoming]) : incoming,
        );
      }
      if (
        envelope.testCaseFinished &&
        !envelope.testCaseFinished.willBeRetried
      ) {
        const testCaseStartedId = envelope.testCaseFinished.testCaseStartedId;
        const pickleId = pickleIdByTestCaseStartedId.get(testCaseStartedId);
        const pickle = pickleId ? pickleByPickleId.get(pickleId) : undefined;
        if (pickle) {
          const stepResult =
            stepResultByTestCaseStartedId.get(testCaseStartedId);
          results.push({
            uri: pickle.uri,
            featureName: featureNameByUri.get(pickle.uri) ?? pickle.uri,
            name: pickle.name,
            status: stepResult?.status ?? TestStepResultStatus.UNDEFINED,
            errorMessage: stepResult?.message,
          });
        }
      }
    });

    (project.provide as (key: string, value: unknown) => void)(
      CUCUMBER_RESULTS_KEY,
      results,
    );
  };
}

export const setup = createSetup(
  process.env[CUCUMBER_VITEST_CONFIG_ENV]
    ? JSON.parse(process.env[CUCUMBER_VITEST_CONFIG_ENV] as string)
    : {},
);

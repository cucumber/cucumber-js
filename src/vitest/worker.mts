import { TestStepResultStatus } from "@cucumber/messages";
import { describe, inject, test } from "vitest";
import {
  CUCUMBER_RESULTS_KEY,
  type CucumberPickleResult,
} from "./global_setup.mjs";

/**
 * Replays this one `.feature` file's slice of the whole-suite results
 * (computed once, for real, in `global_setup.ts`) as `describe`/`test`
 * calls. Nothing is re-executed here - results are already known.
 */
export function registerFeatureFile({ id }: { id: string }): void {
  const allResults = (
    inject as (key: string) => CucumberPickleResult[] | undefined
  )(CUCUMBER_RESULTS_KEY);
  const results = (allResults ?? []).filter((result) => result.uri === id);

  if (results.length === 0) {
    test(id, ({ skip }) => {
      skip();
    });
    return;
  }

  describe(results[0].featureName, () => {
    for (const result of results) {
      if (result.status === TestStepResultStatus.SKIPPED) {
        test.skip(result.name, () => {});
        continue;
      }
      test(result.name, () => {
        if (result.status !== TestStepResultStatus.PASSED) {
          throw new Error(result.errorMessage ?? TestStepResultStatus.UNKNOWN);
        }
      });
    }
  });
}

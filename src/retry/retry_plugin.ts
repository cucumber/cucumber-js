import type { IRunOptionsRuntime } from '../api'
import { PickleTagFilter } from '../pickle_filter'
import type { InternalPlugin } from '../plugin'

/**
 * Built-in retry behaviour: grants a failed test case up to `retry` further
 * attempts, optionally only for pickles matching `retryTagFilter`
 * @remarks
 * This plugin only ever grants a retry; when it has no opinion it passes the
 * decision through unchanged, so plugins registered after it can veto or extend.
 */
export const retryPlugin: InternalPlugin<Pick<IRunOptionsRuntime, 'retry' | 'retryTagFilter'>> = {
  type: 'plugin',
  coordinator: ({ transform, options }) => {
    if (!options.retry) {
      return
    }
    const tagFilter = options.retryTagFilter
      ? new PickleTagFilter(options.retryTagFilter)
      : undefined
    transform('testCase:retry', (_willBeRetried, { pickle, attempt }) => {
      if (tagFilter && !tagFilter.matchesAllTagExpressions(pickle)) {
        return undefined
      }
      return attempt < options.retry ? true : undefined
    })
  },
}

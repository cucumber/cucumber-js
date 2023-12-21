import { performance } from 'node:perf_hooks'
import * as messages from '@cucumber/messages'

interface ProtectedTimingBuiltins {
  clearImmediate: typeof clearImmediate
  clearInterval: typeof clearInterval
  clearTimeout: typeof clearTimeout
  Date: typeof Date
  setImmediate: typeof setImmediate
  setInterval: typeof setInterval
  setTimeout: typeof setTimeout
  performance: typeof performance
}

const methods: Partial<ProtectedTimingBuiltins> = {
  clearInterval: clearInterval.bind(global),
  clearTimeout: clearTimeout.bind(global),
  Date,
  setInterval: setInterval.bind(global),
  setTimeout: setTimeout.bind(global),
  performance,
}

if (typeof setImmediate !== 'undefined') {
  methods.setImmediate = setImmediate.bind(global)
  methods.clearImmediate = clearImmediate.bind(global)
}

export function durationBetweenTimestamps(
  startedTimestamp: messages.Timestamp,
  finishedTimestamp: messages.Timestamp
): messages.Duration {
  const durationMillis =
    messages.TimeConversion.timestampToMillisecondsSinceEpoch(
      finishedTimestamp
    ) -
    messages.TimeConversion.timestampToMillisecondsSinceEpoch(startedTimestamp)
  return messages.TimeConversion.millisecondsToDuration(durationMillis)
}

export async function wrapPromiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutInMilliseconds: number,
  timeoutMessage: string = ''
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>
  if (timeoutMessage === '') {
    timeoutMessage = `Action did not complete within ${timeoutInMilliseconds} milliseconds`
  }
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    timeoutId = methods.setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutInMilliseconds)
  })
  return await Promise.race([promise, timeoutPromise]).finally(() =>
    methods.clearTimeout(timeoutId)
  )
}

export default methods

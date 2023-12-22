import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { promisify } from 'node:util'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import Runtime, { IRuntimeOptions } from '../src/runtime'
import { EventDataCollector } from '../src/formatter/helpers'
import FormatterBuilder from '../src/formatter/builder'
import { SupportCodeLibrary } from '../src/support_code_library_builder/types'
import { ITestCaseAttempt } from '../src/formatter/helpers/event_data_collector'
import { doesNotHaveValue } from '../src/value_checker'
import { emitSupportCodeMessages } from '../src/cli/helpers'
import { FormatOptions } from '../src/formatter'
import { generateEvents } from './gherkin_helpers'
import { buildOptions, buildSupportCodeLibrary } from './runtime_helpers'

const { uuid } = IdGenerator

export interface ITestSource {
  data: string
  uri: string
}

export interface ITestRunOptions {
  runtimeOptions?: Partial<IRuntimeOptions>
  supportCodeLibrary?: SupportCodeLibrary
  sources?: ITestSource[]
  pickleFilter?: (pickle: messages.Pickle) => boolean
}

export interface ITestFormatterOptions extends ITestRunOptions {
  parsedArgvOptions?: FormatOptions
  type: string
}

export interface IEnvelopesAndEventDataCollector {
  envelopes: messages.Envelope[]
  eventDataCollector: EventDataCollector
}

export async function testFormatter({
  parsedArgvOptions = {},
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  type,
}: ITestFormatterOptions): Promise<string> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  emitSupportCodeMessages({
    supportCodeLibrary,
    eventBroadcaster,
    newId: uuid(),
  })
  let output = ''
  const logFn = (data: string): void => {
    output += data
  }
  const passThrough = new PassThrough()
  await FormatterBuilder.build(type, {
    env: {},
    cwd: '',
    eventBroadcaster,
    eventDataCollector,
    log: logFn,
    parsedArgvOptions,
    stream: passThrough,
    cleanup: promisify(passThrough.end.bind(passThrough)),
    supportCodeLibrary,
  })
  let pickleIds: string[] = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map((p) => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return normalizeSummaryDuration(output)
}

export async function getTestCaseAttempts({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
}: ITestRunOptions): Promise<ITestCaseAttempt[]> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  let pickleIds: string[] = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map((p) => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return eventDataCollector.getTestCaseAttempts()
}

export async function getEnvelopesAndEventDataCollector({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  pickleFilter = () => true,
}: ITestRunOptions): Promise<IEnvelopesAndEventDataCollector> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  const envelopes: messages.Envelope[] = []
  eventBroadcaster.on('envelope', (envelope) => envelopes.push(envelope))
  emitSupportCodeMessages({
    supportCodeLibrary,
    eventBroadcaster,
    newId: IdGenerator.uuid(),
  })
  let pickleIds: string[] = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.filter(pickleFilter).map((p) => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return { envelopes, eventDataCollector }
}

export function normalizeSummaryDuration(output: string): string {
  return output.replace(
    /\d+m\d{2}\.\d{3}s \(executing steps: \d+m\d{2}\.\d{3}s\)/,
    '<duration-stat>'
  )
}

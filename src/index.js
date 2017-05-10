import SupportCodeFns from './support_code_fns'
import * as helpers from './support_code_library/helpers'

export {default as Cli} from './cli'
export {default as FeatureParser} from './cli/feature_parser'
export {default as Formatter} from './formatter'
export {default as FormatterBuilder} from './formatter/builder'
export {default as JsonFormatter} from './formatter/json_formatter'
export {default as PrettyFormatter} from './formatter/pretty_formatter'
export {default as ProgressFormatter} from './formatter/progress_formatter'
export {default as RerunFormatter} from './formatter/rerun_formatter'
export {default as Runtime} from './runtime'
export {default as ScenarioFilter} from './scenario_filter'
export {default as SnippetsFormatter} from './formatter/snippets_formatter'
export {default as Status} from './status'
export {default as SummaryFormatter} from './formatter/summary_formatter'
export {default as SupportCodeLibraryBuilder} from './support_code_library/builder'
export {default as UsageFormatter} from './formatter/usage_formatter'
export {default as UsageJsonFormatter} from './formatter/usage_json_formatter'

export const defineSupportCode = SupportCodeFns.add
export const getSupportCodeFns = SupportCodeFns.get
export const clearSupportCodeFns = SupportCodeFns.reset

const cwd = process.cwd()
const step = helpers.defineStepFactory(cwd)
const hook = helpers.defineHookFactory(cwd)
export const defineStep = (pattern, options, code) => {
  SupportCodeFns.addStepDefinition(step(pattern, options, code))
}
export const given = defineStep
export const when = defineStep
export const then = defineStep
export const before = (options, code) => {
  SupportCodeFns.addBeforeHook(hook(options, code))
}
export const after = (options, code) => {
  SupportCodeFns.addAfterHook(hook(options, code))
}


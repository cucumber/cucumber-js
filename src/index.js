// Top level
export { default as Cli } from './cli'
export { default as GherkinDocumentParser } from './gherkin_document_parser'
export { default as KeywordType, getStepKeywordType } from './keyword_type'
export { default as PickleFilter } from './pickle_filter'
export { default as PickleParser } from './pickle_parser'
export { default as Runtime } from './runtime'
export { default as Status } from './status'
export {
  default as SupportCodeLibraryBuilder
} from './support_code_library/builder'

// Formatters
export { default as Formatter } from './formatter'
export { default as FormatterBuilder } from './formatter/builder'
export { default as JsonFormatter } from './formatter/json_formatter'
export { default as ProgressFormatter } from './formatter/progress_formatter'
export { default as RerunFormatter } from './formatter/rerun_formatter'
export { default as SnippetsFormatter } from './formatter/snippets_formatter'
export { default as SummaryFormatter } from './formatter/summary_formatter'
export { default as UsageFormatter } from './formatter/usage_formatter'
export { default as UsageJsonFormatter } from './formatter/usage_json_formatter'
import * as formatterHelpers from './formatter/helpers'
export { formatterHelpers }

// Support Code Library
import SupportCodeFns from './support_code_fns'
export const defineSupportCode = SupportCodeFns.add
export const getSupportCodeFns = SupportCodeFns.get
export const clearSupportCodeFns = SupportCodeFns.reset

const proxySupportCode = name => (...args) =>
  defineSupportCode(supportCodeContext => supportCodeContext[name](...args))

export const defineStep = proxySupportCode('defineStep')
export const addTransform = proxySupportCode('addTransform')
export const defineParameterType = proxySupportCode('defineParameterType')
export const After = proxySupportCode('After')
export const AfterAll = proxySupportCode('AfterAll')
export const Before = proxySupportCode('Before')
export const BeforeAll = proxySupportCode('BeforeAll')
export const setDefaultTimeout = proxySupportCode('setDefaultTimeout')
export const setDefinitionFunctionWrapper = proxySupportCode(
  'setDefinitionFunctionWrapper'
)
export const setWorldConstructor = proxySupportCode('setWorldConstructor')
export const Given = defineStep
export const When = defineStep
export const Then = defineStep

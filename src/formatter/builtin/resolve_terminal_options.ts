import type { SummaryOptions } from '@cucumber/pretty-formatter'
import { FormatOptions } from '..'

export function resolveTerminalOptions(options: FormatOptions) {
  const includeAttachments =
    options.includeAttachments ?? options.printAttachments
  const resolvedOptions: SummaryOptions = {}
  if (includeAttachments !== undefined) {
    resolvedOptions.includeAttachments = includeAttachments
  }
  if (options.theme !== undefined) {
    resolvedOptions.theme = options.theme
  }
  return resolvedOptions
}

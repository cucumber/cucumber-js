import util from 'util'

export function parseStepArgument(arg, mapping) {
  if (arg.dataTable) {
    return mapping.dataTable(arg.dataTable)
  } else if (arg.docString) {
    return mapping.docString(arg.docString)
  }
  throw new Error(`Unknown step argument: ${util.inspect(arg)}`)
}

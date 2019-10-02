import util from 'util'

export function buildStepArgumentIterator(mapping) {
  return function(arg) {
    if (Object.prototype.hasOwnProperty.call(arg, 'dataTable')) {
      return mapping.dataTable(arg.dataTable)
    } else if (Object.prototype.hasOwnProperty.call(arg, 'docString')) {
      return mapping.docString(arg.docString)
    }
    throw new Error(`Unknown argument type:${util.inspect(arg)}`)
  }
}

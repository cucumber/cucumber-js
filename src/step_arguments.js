import util from 'util'

export function buildStepArgumentIterator(mapping) {
  return function(arg) {
    if (Object.prototype.hasOwnProperty.call(arg, 'rows')) {
      return mapping.dataTable(arg)
    } else if (Object.prototype.hasOwnProperty.call(arg, 'content')) {
      return mapping.docString(arg)
    }
    throw new Error(`Unknown argument type:${util.inspect(arg)}`)
  }
}

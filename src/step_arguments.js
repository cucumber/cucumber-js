import util from 'util'

export function buildStepArgumentIterator(mapping) {
  return function(arg) {
    if (arg.hasOwnProperty('rows')) {
      return mapping.dataTable(arg)
    } else if (arg.hasOwnProperty('content')) {
      return mapping.docString(arg)
    } else {
      throw new Error('Unknown argument type:' + util.inspect(arg))
    }
  }
}

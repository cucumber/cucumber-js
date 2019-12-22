import util from 'util'
import { messages } from 'cucumber-messages'

export interface IPickleStepArgumentFunctionMap<T> {
  dataTable: (arg: messages.PickleStepArgument.IPickleTable) => T
  docString: (arg: messages.PickleStepArgument.IPickleDocString) => T
}

export function parseStepArgument<T>(
  arg: messages.IPickleStepArgument,
  mapping: IPickleStepArgumentFunctionMap<T>
) {
  if (arg.dataTable) {
    return mapping.dataTable(arg.dataTable)
  } else if (arg.docString) {
    return mapping.docString(arg.docString)
  }
  throw new Error(`Unknown step argument: ${util.inspect(arg)}`)
}

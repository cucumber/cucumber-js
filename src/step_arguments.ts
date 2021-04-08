import util from 'util'
import { messages } from '@cucumber/messages'
import { doesHaveValue } from './value_checker'

export interface IPickleStepArgumentFunctionMap<T> {
  dataTable: (arg: messages.PickleStepArgument.IPickleTable) => T
  docString: (arg: messages.PickleStepArgument.IPickleDocString) => T
}

export function parseStepArgument<T>(
  arg: messages.IPickleStepArgument,
  mapping: IPickleStepArgumentFunctionMap<T>
): T {
  if (doesHaveValue(arg.dataTable)) {
    return mapping.dataTable(arg.dataTable)
  } else if (doesHaveValue(arg.docString)) {
    return mapping.docString(arg.docString)
  }
  throw new Error(`Unknown step argument: ${util.inspect(arg)}`)
}

import type { PickleDocString, PickleStepArgument, PickleTable } from '@cucumber/messages'

export interface IPickleStepArgumentFunctionMap<T> {
  dataTable: (arg: PickleTable) => T
  docString: (arg: PickleDocString) => T
}

/**
 * Map the data table and/or doc string of a step, in the order they appear in the source
 * @remarks
 * Where the argument index is not present, the data table comes first
 */
export function parseStepArguments<T>(
  arg: PickleStepArgument | undefined,
  mapping: IPickleStepArgumentFunctionMap<T>
): T[] {
  return [arg?.dataTable, arg?.docString]
    .filter((stepArgument): stepArgument is PickleTable | PickleDocString => !!stepArgument)
    .sort(
      (a, b) =>
        (a.argumentIndex ?? Number.MAX_SAFE_INTEGER) - (b.argumentIndex ?? Number.MAX_SAFE_INTEGER)
    )
    .map((stepArgument) =>
      'rows' in stepArgument ? mapping.dataTable(stepArgument) : mapping.docString(stepArgument)
    )
}

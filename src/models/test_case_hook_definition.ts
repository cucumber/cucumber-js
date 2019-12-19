import { PickleTagFilter } from '../pickle_filter'
import Definition, { IDefinition, IGetInvocationDataResponse, IGetInvocationDataRequest } from './definition'

export default class TestCaseHookDefinition extends Definition implements IDefinition {
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data) {
    super(data)
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle) {
    return this.pickleTagFilter.matchesAllTagExpressions(pickle)
  }

  getInvocationParameters({ hookParameter }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    return Promise.resolve({
      getInvalidCodeLengthMessage: () => this.buildInvalidCodeLengthMessage('0 or 1', '2'),
      parameters: [hookParameter],
      validCodeLengths: [0, 1, 2]
    })
  }
}

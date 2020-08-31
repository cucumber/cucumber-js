import { PickleTagFilter } from '../pickle_filter'
import Definition, {
  IDefinition,
  IGetInvocationDataResponse,
  IGetInvocationDataRequest,
  IDefinitionParameters,
  IHookDefinitionOptions,
} from './definition'
import { messages } from '@cucumber/messages'

export default class TestStepHookDefinition extends Definition
  implements IDefinition {
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data: IDefinitionParameters<IHookDefinitionOptions>) {
    super(data)
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle: messages.IPickle): boolean {
    return this.pickleTagFilter.matchesAllTagExpressions(pickle)
  }

  async getInvocationParameters({
    hookParameter,
  }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    return await Promise.resolve({
      getInvalidCodeLengthMessage: () =>
        this.buildInvalidCodeLengthMessage('0 or 1', '2'),
      parameters: [hookParameter],
      validCodeLengths: [0, 1, 2],
    })
  }
}

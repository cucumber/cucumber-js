import { PickleTagFilter } from '../pickle_filter'
import Definition, {
  IDefinition,
  IGetInvocationDataResponse,
  IGetInvocationDataRequest,
  IDefinitionParameters,
  IHookDefinitionOptions,
} from './definition'
import * as messages from '@cucumber/messages'

export default class TestStepHookDefinition
  extends Definition
  implements IDefinition {
  public readonly tagExpression: string
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data: IDefinitionParameters<IHookDefinitionOptions>) {
    super(data)
    this.tagExpression = data.options.tags
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle: messages.Pickle): boolean {
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

import * as messages from '@cucumber/messages'
import { PickleTagFilter } from '../pickle_filter'
import Definition, {
  IDefinition,
  IDefinitionParameters,
  IGetInvocationDataRequest,
  IGetInvocationDataResponse,
  IHookDefinitionOptions,
} from './definition'

export default class TestCaseHookDefinition
  extends Definition
  implements IDefinition
{
  public readonly name: string
  public readonly tagExpression: string
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data: IDefinitionParameters<IHookDefinitionOptions>) {
    super(data)
    this.name = data.options.name
    this.tagExpression = data.options.tags
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle: messages.Pickle): boolean {
    return this.pickleTagFilter.matchesAllTagExpressions(pickle)
  }

  async getInvocationParameters({
    hookParameter,
  }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    return {
      getInvalidCodeLengthMessage: () =>
        this.buildInvalidCodeLengthMessage('0 or 1', '2'),
      parameters: [hookParameter],
      validCodeLengths: [0, 1, 2],
    }
  }
}

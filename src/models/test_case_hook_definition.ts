import { PickleTagFilter } from '../pickle_filter'
import Definition, {
  IDefinition,
  IGetInvocationDataResponse,
  IGetInvocationDataRequest,
  IDefinitionParameters,
  IHookDefinitionOptions,
} from './definition'
import { io } from 'cucumber-messages/dist/src/cucumber-messages'
import IPickle = io.cucumber.messages.IPickle

export default class TestCaseHookDefinition extends Definition
  implements IDefinition {
  private readonly pickleTagFilter: PickleTagFilter

  constructor(data: IDefinitionParameters<IHookDefinitionOptions>) {
    super(data)
    this.pickleTagFilter = new PickleTagFilter(data.options.tags)
  }

  appliesToTestCase(pickle: IPickle): boolean {
    return this.pickleTagFilter.matchesAllTagExpressions(pickle)
  }

  async getInvocationParameters({
    hookParameter,
  }: IGetInvocationDataRequest): Promise<IGetInvocationDataResponse> {
    return Promise.resolve({
      getInvalidCodeLengthMessage: () =>
        this.buildInvalidCodeLengthMessage('0 or 1', '2'),
      parameters: [hookParameter],
      validCodeLengths: [0, 1, 2],
    })
  }
}

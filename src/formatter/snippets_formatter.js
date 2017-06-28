import Formatter from './'
import Status from '../status'

export default class SnippetsFormatter extends Formatter {
  handleStepResult(stepResult) {
    if (stepResult.status === Status.UNDEFINED) {
      const snippet = this.snippetBuilder.build(stepResult.step)
      this.log(snippet + '\n\n')
    }
  }
}

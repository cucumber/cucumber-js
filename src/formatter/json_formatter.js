import _ from 'lodash'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import Formatter from './'
import Status from '../status'
import util from 'util'

export default class JsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    this.features = []
  }

  convertNameToId(obj) {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  formatAttachments(attachments) {
    return attachments.map(function (attachment) {
      return {
        data: attachment.data,
        mime_type: attachment.mimeType
      }
    })
  }

  formatDataTable(dataTable) {
    return {
      rows: dataTable.raw().map(function (row) {
        return {cells: row}
      })
    }
  }

  formatDocString(docString) {
    return _.pick(docString, ['content', 'contentType', 'line'])
  }

  formatStepArguments(stepArguments) {
    return _.map(stepArguments, (arg) => {
      if (arg instanceof DataTable) {
        return this.formatDataTable(arg)
      } else if (arg instanceof DocString) {
        return this.formatDocString(arg)
      } else {
        throw new Error(`Unknown argument type: ${util.inspect(arg)}`)
      }
    })
  }

  handleAfterFeatures() {
    this.log(JSON.stringify(this.features, null, 2))
  }

  handleBeforeFeature(feature) {
    this.currentFeature = _.pick(feature, [
      'description',
      'keyword',
      'line' ,
      'name',
      'tags',
      'uri'
    ])
    _.assign(this.currentFeature, {
      elements: [],
      id: this.convertNameToId(feature)
    })
    this.features.push(this.currentFeature)
  }

  handleBeforeScenario(scenario) {
    this.currentScenario = _.pick(scenario, [
      'description',
      'keyword',
      'line',
      'name',
      'tags'
    ])
    _.assign(this.currentScenario, {
      id: this.currentFeature.id + ';' + this.convertNameToId(scenario),
      steps: []
    })
    this.currentFeature.elements.push(this.currentScenario)
  }

  handleStepResult(stepResult) {
    const step = stepResult.step
    const status = stepResult.status

    const currentStep = {
      arguments: this.formatStepArguments(step.arguments),
      keyword: step.keyword,
      name: step.name,
      result: {status}
    }

    if (step.constructor.name === 'Hook') {
      currentStep.hidden = true
    } else {
      currentStep.line = step.line
    }

    if (status === Status.PASSED || status === Status.FAILED) {
      currentStep.result.duration = stepResult.duration
    }

    if (_.size(stepResult.attachments) > 0) {
      currentStep.embeddings = this.formatAttachments(stepResult.attachments)
    }

    if (status === Status.FAILED && stepResult.failureException) {
      currentStep.result.error_message = (stepResult.failureException.stack || stepResult.failureException)
    }

    if (stepResult.stepDefinition) {
      const location = stepResult.stepDefinition.uri + ':' + stepResult.stepDefinition.line
      currentStep.match = {location}
    }

    this.currentScenario.steps.push(currentStep)
  }
}

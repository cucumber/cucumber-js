import _ from 'lodash'
import colors from 'colors/safe'
import Status from '../status'

colors.enabled = true

export default function getColorFns(enabled) {
  if (enabled) {
    return {
      [Status.AMBIGUOUS]: ::colors.red,
      [Status.FAILED]: ::colors.red,
      [Status.FLAKY]: ::colors.yellow,
      [Status.PASSED]: ::colors.green,
      [Status.PENDING]: ::colors.yellow,
      [Status.RETRY]: ::colors.yellow,
      [Status.SKIPPED]: ::colors.cyan,
      [Status.UNDEFINED]: ::colors.yellow,
      location: ::colors.gray,
      tag: ::colors.cyan,

      // For assertion-error-formatter
      diffAdded: ::colors.green,
      diffRemoved: ::colors.red,
      errorMessage: ::colors.red,
      errorStack: ::colors.gray,
    }
  } else {
    return {
      [Status.AMBIGUOUS]: _.identity,
      [Status.FAILED]: _.identity,
      [Status.FLAKY]: _.identity,
      [Status.PASSED]: _.identity,
      [Status.PENDING]: _.identity,
      [Status.SKIPPED]: _.identity,
      [Status.UNDEFINED]: _.identity,
      location: _.identity,
      tag: _.identity,

      // For assertion-error-formatter
      diffAdded: _.identity,
      diffRemoved: _.identity,
      errorMessage: _.identity,
      errorStack: _.identity,
    }
  }
}

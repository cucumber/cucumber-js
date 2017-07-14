import _ from 'lodash'
import stackChain from 'stack-chain'
import path from 'path'

export default class StackTraceFilter {
  constructor() {
    this.cucumberPath = path.join(__dirname, '..', '..')
  }

  filter() {
    this.currentFilter = stackChain.filter.attach((error, frames) => {
      if (this.isErrorInCucumber(frames)) {
        return frames
      }
      const index = _.findIndex(frames, ::this.isFrameInCucumber)
      if (index === -1) {
        return frames
      } else {
        return frames.slice(0, index)
      }
    })
  }

  isErrorInCucumber(frames) {
    const filteredFrames = _.reject(frames, ::this.isFrameInNode)
    return (
      filteredFrames.length > 0 && this.isFrameInCucumber(filteredFrames[0])
    )
  }

  isFrameInCucumber(frame) {
    const fileName = frame.getFileName() || ''
    return _.startsWith(fileName, this.cucumberPath)
  }

  isFrameInNode(frame) {
    const fileName = frame.getFileName() || ''
    return !_.includes(fileName, path.sep)
  }

  unfilter() {
    stackChain.filter.deattach(this.currentFilter)
  }
}

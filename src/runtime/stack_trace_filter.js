import _ from 'lodash'
import stackChain from 'stack-chain'
import path from 'path'

export default class StackTraceFilter {
  constructor() {
    this.cucumberPath = path.join(__dirname, '..', '..')
  }

  filter() {
    this.currentFilter = stackChain.filter.attach((error, frames) => {
      if (frames.length > 0 && this.isFrameInCucumber(frames[0])) {
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

  isFrameInCucumber(frame) {
    const fileName = frame.getFileName() || ''
    return _.startsWith(fileName, this.cucumberPath)
  }

  unfilter() {
    stackChain.filter.deattach(this.currentFilter)
  }
}

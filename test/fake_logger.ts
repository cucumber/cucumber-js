import { ILogger } from '../src/logger'
import sinon from 'sinon'

export class FakeLogger implements ILogger {
  debug = sinon.fake()
  error = sinon.fake()
  warn = sinon.fake()
}

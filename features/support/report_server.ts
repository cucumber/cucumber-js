export default class ReportServer {
  getReceivedMessageTypes(): readonly string[] {
    return ['meta', 'testRunStarted', 'testRunFinished']
  }
}

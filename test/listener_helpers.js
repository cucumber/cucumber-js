export function expectToHearEvents(listener, expectedEvents) {
  let previousStub = null
  let callNumberMapping = {}
  expectedEvents.forEach(function([expectedName, expectedData]) {
    const fnName = 'handle' + expectedName
    if (!callNumberMapping[fnName]) {
      callNumberMapping[fnName] = 0
    }
    const stub = listener[fnName].getCall(callNumberMapping[fnName])
    callNumberMapping[fnName] += 1

    const arg = stub.args[0]
    if (typeof expectedData === 'function') {
      expectedData(arg)
    } else {
      expect(arg).to.eql(expectedData)
    }

    if (previousStub) {
      expect(stub).to.have.been.calledAfter(previousStub)
    }
    previousStub = stub
  })
}

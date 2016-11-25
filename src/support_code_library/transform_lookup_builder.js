import {Transform, TransformLookup} from 'cucumber-expressions'

function build() {
  const transformLookup = new TransformLookup()
  const stringInDoubleQuotesTransform = new Transform(
    'stringInDoubleQuotes',
    function() {},
    '"[^"]*"',
    JSON.parse
  )
  transformLookup.addTransform(stringInDoubleQuotesTransform)
  return transformLookup
}

export default {build}

export function normalizeEventProtocolOutput(str, cwd) {
  return (
    str
      .replace(/"duration":\d*/g, '"duration":0')
      // Converting windows stack trace
      //   features\\a.feature
      //     to
      //   features/a.feature
      .replace(
        /"uri":"([^"]*)"/g,
        (match, uri) => `"uri":"${uri.replace(/\\\\/g, '/')}"`
      )
      // Converting windows stack trace
      //    C:\\project\\path\\features\\support/code.js
      //      to
      //    features/support/code.js
      .replace(/"exception":"([^"]*)"/g, (match, exception) => {
        const updatedException = exception
          .replace(/\\\\/g, '\\')
          .replace(cwd, '')
          .replace(/\\/g, '/')
          .replace('/features', 'features')
        return `"exception":"${updatedException}"`
      })
      .split('\n')
      .filter(x => x)
      .map(x => JSON.parse(x))
  )
}

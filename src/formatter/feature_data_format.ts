import { faker } from '@faker-js/faker'

const generateTestData = (
  featureFileContent: string,
  vars?: any,
  fakeData?: {
    var: string
    fake: string
  }[]
) => {
  const regexp = /\{\{([^}]+)\}\}/g
  const variableRegex = /^([a-zA-Z0-9_]*)=(.*)/g
  let newContent = featureFileContent
  let match: RegExpExecArray
  const matches = []
  // collect all matches
  while ((match = regexp.exec(featureFileContent)) !== null) {
    matches.push(match)
  }
  // find all variables in the matches
  const variables: any = { ...vars }

  if (Object.keys(variables).length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const _match = matches[i]
      const value = _match[1]
      const variableMatch = variableRegex.exec(value)
      if (variableMatch !== null) {
        newContent = newContent.replaceAll(_match[0], `{{${variableMatch[1]}}}`)
      }
    }

    for (const key in variables) {
      const variable = variables[key]
      newContent = newContent.replaceAll(`{{${variable.var}}}`, variable.fake)
    }
  } else {
    for (let i = 0; i < matches.length; i++) {
      const _match = matches[i]
      const value = _match[1]
      const variableMatch = variableRegex.exec(value)
      if (variableMatch !== null) {
        variables[variableMatch[1]] = {
          var: variableMatch[1],
          toFake: variableMatch[2],
        }
        newContent = newContent.replaceAll(_match[0], `{{${variableMatch[1]}}}`)
      }
    }

    for (const key in variables) {
      const variable = variables[key]
      const fake = faker.helpers.fake(`{{${variable.toFake}}}`)
      newContent = newContent.replaceAll(`{{${variable.var}}}`, fake)
      variables[key].fake = fake
    }
  }

  regexp.lastIndex = 0
  const otherFakeData = []
  const duplicateFakeData = fakeData ? [...fakeData] : []
  let fakeIndex = 0

  while ((match = regexp.exec(featureFileContent)) !== null) {
    try {
      const fake =
        duplicateFakeData && duplicateFakeData.length > 0
          ? duplicateFakeData.shift().fake
          : faker.helpers.fake(match[0])
      otherFakeData.push({
        var: match[0],
        fake,
      })
      newContent = newContent.replace(match[0], fake)
      fakeIndex++
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('unknown faker variable:' + match[0])
    }
  }

  return {
    newContent,
    variables,
    otherFakeData,
    changed: newContent !== featureFileContent,
    fakeIndex,
  }
}

//let result = generateTestData("/Users/guyarieli/Documents/GitHub/ai-qa/cucumber_demo/features/create_issues.feature");
//console.log(result.newContent);
export { generateTestData }

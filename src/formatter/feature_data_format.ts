import { faker } from '@faker-js/faker'

const generateTestData = (featureFileContent: string, vars?: any) => {
  const regexp = /\{\{([^}]+)\}\}/g
  let newContent = featureFileContent
  let match
  const metches = []
  // collect all matches
  while ((match = regexp.exec(featureFileContent)) !== null) {
    metches.push(match)
  }
  // find all variables in the matches
  let variables: any = {}
  const variableRegex = /^([a-zA-Z0-9_]*)=(.*)/g

  if (vars) {
    variables = vars
    for (let i = 0; i < metches.length; i++) {
      const _match = metches[i]
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
    for (let i = 0; i < metches.length; i++) {
      const _match = metches[i]
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
  while ((match = regexp.exec(newContent)) !== null) {
    try {
      const fake = faker.helpers.fake(match[0])
      otherFakeData.push({
        var: match[0],
        fake,
      })
      newContent = newContent.replace(match[0], fake)
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
  }
}

//let result = generateTestData("/Users/guyarieli/Documents/GitHub/ai-qa/cucumber_demo/features/create_issues.feature");
//console.log(result.newContent);
export { generateTestData }

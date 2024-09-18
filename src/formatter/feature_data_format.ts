import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { TableCell } from '@cucumber/messages'
import JSON5 from 'json5'

const generateTestData = (
  featureFileContent: string,
  vars?: any,
  fakeData?: {
    var: string
    fake: string
  }[],
  projectDir?: string
) => {
  const regexp = /\{\{([^}]*\([^)]*\))\}\}/g
  const variableRegex = /^([a-zA-Z0-9_]*)=(.*)/g
  let newContent = featureFileContent
  let match: RegExpExecArray
  if (!projectDir) {
    projectDir = process.cwd()
  }
  const namespacePath = path.join(
    projectDir,
    'features',
    'step_definitions',
    'namespaces.json'
  )
  let namespaces: string[] = fs.existsSync(namespacePath)
    ? JSON.parse(fs.readFileSync(namespacePath, 'utf-8'))
    : []
  if (!Array.isArray(namespaces)) {
    namespaces = []
  }
  const matches = []
  // collect all matches
  while ((match = regexp.exec(featureFileContent)) !== null) {
    // match[0] is the full match, match[1] is the first capturing group
    // Eg:- match[0] = {{name}}, match[1] = name
    if (!namespaces.includes(match[1].split('.')[0])) matches.push(match)
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
      const fake = getFakeString(
        variable.toFake.substring(2, variable.toFake.length - 2)
      )
      newContent = newContent.replaceAll(`{{${variable.var}}}`, fake)
      variables[key].fake = fake
    }
  }

  regexp.lastIndex = 0
  const otherFakeData = []
  const duplicateFakeData = fakeData ? [...fakeData] : []
  let fakeIndex = 0
  while ((match = regexp.exec(featureFileContent)) !== null) {
    if (namespaces.includes(match[1].split('.')[0])) continue
    try {
      const fake =
        duplicateFakeData &&
        duplicateFakeData.length > 0 &&
        duplicateFakeData[0].var === match[0]
          ? duplicateFakeData.shift().fake
          : getFakeString(match[0].substring(2, match[0].length - 2))
      otherFakeData.push({
        var: match[0],
        fake,
      })
      newContent = newContent.replace(match[0], fake)
      fakeIndex++
    } catch (err) {
      // eslint-disable-next-line no-console
      //console.log('unknown faker variable:' + match[0])
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

const getFakeString = (content: string) => {
  const faking = content.split('(')[0].split('.')
  const argument = content.substring(
    content.indexOf('(') + 1,
    content.indexOf(')')
  )
  let fakeFunc: any = faker
  faking.forEach((f: string) => {
    fakeFunc = fakeFunc[f]
  })

  try {
    return fakeFunc(JSON5.parse(argument))
  } catch (error) {
    return fakeFunc(argument)
  }
}

const getDefinitionFunction = (
  feature_path: string,
  functionName: string,
  functionFile: string
) => {
  const mjsFiles = fs
    .readdirSync(path.join(feature_path, '../step_definitions'))
    .filter((file) => file === `${functionFile}.js`)

  if (mjsFiles.length === 0) {
    throw new Error(`File ${functionFile} not found in step_definitions folder`)
  }

  const [mjsData] = mjsFiles.map((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { [functionName]: func } = require(path.join(
      feature_path,
      '../step_definitions',
      file
    ))
    if (!func)
      throw new Error(`Function ${functionName} not found in file ${file}`)

    return func()
  })

  return mjsData
}

const generateExamplesFromFunction = (
  data: string,
  feature_path: string,
  functionName: string,
  functionFile: string
) => {
  const examples = data.split('Examples:')[1].split('\n').slice(1)
  const headers = examples[0]
    .split('|')
    .map((header) => header.trim())
    .filter((header) => header !== '')
  const values = examples[1]
    .split('|')
    .map((value) => value.trim())
    .filter((header) => header !== '')

  const mjsData = getDefinitionFunction(
    feature_path,
    functionName,
    functionFile
  )

  const newExamples = headers.map((header) => {
    if (mjsData[header]) {
      return mjsData[header]
    }
    return values[headers.indexOf(header)]
  })

  let newExamplesString = data.split('Examples:')[1]
  newExamples.forEach((example, index) => {
    newExamplesString = newExamplesString.replace(values[index], example)
  })

  const newData = data.replace(data.split('Examples:')[1], newExamplesString)

  return { newData, mjsData }
}

const generateExamplesFromFunctionGherkin = (
  headers: readonly TableCell[],
  values: readonly TableCell[],
  mjsData: any
) => {
  const newExamples = headers.map(({ value: header }, index) => {
    if (mjsData[header]) {
      return { header, value: mjsData[header] }
    }
    return { header, value: values[index].value }
  })

  return newExamples
}

export {
  generateTestData,
  generateExamplesFromFunction,
  generateExamplesFromFunctionGherkin,
}

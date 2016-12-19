/* eslint-disable babel/new-cap */

import {defineSupportCode} from '../../'
import {normalizeText} from '../support/helpers'
import {promisify} from 'bluebird'
import assert from 'assert'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import path from 'path'

defineSupportCode(function({Given, Then}) {
  Given(/^a file named "(.*)" with:$/, function(filePath, fileContent) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.outputFile)(absoluteFilePath, fileContent)
  })

  Given(/^an empty file named "(.*)"$/, function(filePath) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.outputFile)(absoluteFilePath, '')
  })

  Given(/^a directory named "(.*)"$/, function(filePath) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.mkdirp)(absoluteFilePath)
  })

  Then(/^the file "([^"]*)" has the text:$/, async function(filePath, expectedContent) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    const actualContent = normalizeText(content)
    expectedContent = normalizeText(expectedContent)
    assert.equal(actualContent, expectedContent)
  })

  Then(/^the file "([^"]*)" contains the text:$/, async function(filePath, expectedContent) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    const actualContent = normalizeText(content)
    expectedContent = normalizeText(expectedContent)
    if (actualContent.indexOf(expectedContent) === -1) {
      throw new Error('Expected file "' + filePath + '" to contain the following:\n' +
        expectedContent + '\n' +
        'Got:\n' +
        content + '\n')
    }
  })
})

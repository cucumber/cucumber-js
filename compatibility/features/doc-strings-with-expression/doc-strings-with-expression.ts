import { expect } from 'chai'
import { Given } from '../../../src'

Given('a {string} with a doc string:', (string: string, docString: string) => {
  expect(string).to.eq('Cucumber')
  expect(docString).to.eq('Cucumis sativus')
})

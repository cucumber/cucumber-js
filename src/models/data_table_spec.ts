import { describe, it } from 'mocha'
import { expect } from 'chai'
import DataTable from './data_table'
import * as messages from '@cucumber/messages'

const id = 'id'
const location: messages.Location = { line: 0 }

describe('DataTable', () => {
  describe('table with headers', () => {
    const dataTable: messages.DataTable = {
      location,
      rows: [
        {
          id,
          location,
          cells: [
            { value: 'header 1', location },
            { value: 'header 2', location },
          ],
        },
        {
          id,
          location,
          cells: [
            { value: 'row 1 col 1', location },
            { value: 'row 1 col 2', location },
          ],
        },
        {
          id,
          location,
          cells: [
            { value: 'row 2 col 1', location },
            { value: 'row 2 col 2', location },
          ],
        },
      ],
    }

    describe('rows', () => {
      it('returns a 2-D array without the header', () => {
        expect(new DataTable(dataTable).rows()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('hashes', () => {
      it('returns an array of object where the keys are the headers', () => {
        expect(new DataTable(dataTable).hashes()).to.eql([
          { 'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2' },
          { 'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2' },
        ])
      })
    })

    describe('transpose', () => {
      it('returns a new DataTable, with the data transposed', () => {
        expect(new DataTable(dataTable).transpose().raw()).to.eql([
          ['header 1', 'row 1 col 1', 'row 2 col 1'],
          ['header 2', 'row 1 col 2', 'row 2 col 2'],
        ])
      })
    })
  })

  describe('table without headers', () => {
    const dataTable: messages.DataTable = {
      location,
      rows: [
        {
          id,
          location,
          cells: [
            { value: 'row 1 col 1', location },
            { value: 'row 1 col 2', location },
          ],
        },
        {
          id,
          location,
          cells: [
            { value: 'row 2 col 1', location },
            { value: 'row 2 col 2', location },
          ],
        },
      ],
    }

    describe('raw', () => {
      it('returns a 2-D array', () => {
        expect(new DataTable(dataTable).raw()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('rowsHash', () => {
      it('returns an object where the keys are the first column', () => {
        expect(new DataTable(dataTable).rowsHash()).to.eql({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2',
        })
      })
    })
  })

  describe('table with something other than 2 columns', () => {
    describe('rowsHash', () => {
      it('throws an error if not all rows have two columns', function () {
        const dataTable: messages.DataTable = {
          location,
          rows: [
            {
              id,
              location,
              cells: [{ value: 'row 1 col 1', location }],
            },
            {
              id,
              location,
              cells: [{ value: 'row 2 col 1', location }],
            },
          ],
        }

        expect(() => new DataTable(dataTable).rowsHash()).to.throw(
          'rowsHash can only be called on a data table where all rows have exactly two columns'
        )
      })
    })
  })
})

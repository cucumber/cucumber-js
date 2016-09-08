# Data tables

When steps have a data table, they are passed an object with methods that can be used to access the data.

- with column headers
  - `hashes`: returns an array of objects where each row is converted to an object (column header is the key)
  - `rows`: returns the table as a 2-D array, without the first row
- without column headers
  - `raw`: returns the table as a 2-D array
  - `rowsHash`: returns an object where each row corresponds to an entry (first column is the key, second column is the value)

See this [feature](/features/data_tables.feature) for examples

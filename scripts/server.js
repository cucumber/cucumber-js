const path = require('path')
const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')

const port = process.env.PORT || 9797
const app = connect()
app.use(serveStatic(path.join(__dirname, '..', 'example')))
app.use(serveStatic(path.join(__dirname, '..', 'dist')))

http.createServer(app).listen(port)
/* eslint-disable no-console */
console.log(`Accepting connections on port ${port}...`)
/* eslint-enable no-console */

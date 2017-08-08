let path = require('path')
let http = require('http')
let connect = require('connect')
let serveStatic = require('serve-static')

let port = process.env.PORT || 9797
let app = connect()
app.use(serveStatic(path.join(__dirname, '..', 'example')))
app.use(serveStatic(path.join(__dirname, '..', 'dist')))

http.createServer(app).listen(port)
/* eslint-disable no-console */
console.log('Accepting connections on port ' + port + '...')
/* eslint-enable no-console */

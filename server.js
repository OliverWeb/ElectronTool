// 服务端:
let http = require('http')
let httpServer = http.createServer()
let mosca = require('mosca')

let settings = {
  port: 5112,
  persistence: {
    factory: mosca.persistence.Mongo,
    url: 'mongodb://localhost:27017/mosca'
  }
}
let server = new mosca.Server(settings)

server.attachHttpServer(httpServer)
server.on('published', function (packet, client) {
  console.log('Published', packet.payload.toString())
})
httpServer.listen(3003)
server.on('ready', function () {
  console.log('server is running at port 3003')
})

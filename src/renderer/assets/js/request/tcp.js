var net = require('net')

function tcp (options) {
  let response = {
    connect: '',
    data: '',
    end: '',
    timeout: ''
  }
  let res = new Promise((resolve, reject) => {
    var tcpClient = net.Socket()
    // 连接 tcp server
    tcpClient.connect(options, function () {
      response.connect = true
      tcpClient.write(options.package)
    })

    // 接收数据
    tcpClient.on('data', function (data) {
      console.log(data.toString())
      response.data = data
      tcpClient.destroy()
      resolve(response)
    })
    tcpClient.on('end', function () {
      response.end = true
      resolve(response)
    })

    tcpClient.on('error', function (err) {
      reject(err)
    })
    // 设置超时时间
    tcpClient.setTimeout(1000 * 20, function () {
      response.timeout = true
      resolve(response)
    })
  })
  return res
}
export default {
  install: function (Vue) {
    Vue.prototype.$tcp = (opts) => tcp(opts)
  }
}

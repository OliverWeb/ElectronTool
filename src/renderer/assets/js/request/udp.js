var dgram = require('dgram')
function udp (options) {
  let udpErr = ''
  let response = {
    send: '',
    data: '',
    end: '',
    close: '',
    timeout: ''
  }
  let res = new Promise((resolve, reject) => {
    var client = dgram.createSocket('udp4')
    var mess = Buffer.from(options.package)
    client.send(mess, 0, mess.length, options.port, options.host, function (err, bytes) {
      if (err) {
        reject(err)
      } else {
        response.send = true
        udpErr = ''
        console.log('已发送%d字节数据', bytes)
      }
    })
    client.on('message', function (msg, rinfo) {
      // console.log('已接收服务器发送的数据：%s', msg)
      // console.log('服务器的地址为%s', rinfo.address)
      // console.log('服务器所用端口为%s', rinfo.port)
      response.data = msg
      udpErr = msg
      resolve(response)
      client.close()
    })
    client.on('close', function () {
      response.close = true
      resolve(response)
      // console.log('socket端口被关闭')
    })
    client.on('error', function (err) {
      udpErr = err
      reject(err)
    })
    let timer = setTimeout(() => {
      if (!udpErr) {
        clearTimeout(timer)
        response.timeout = true
        resolve(response)
      }
    }, 1000 * 20)
  })
  return res
}
export default {
  install: function (Vue) {
    Vue.prototype.$udp = (opts) => udp(opts)
  }
}

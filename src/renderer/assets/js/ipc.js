import { ipcRenderer } from 'electron'
const ipcService = Object.create(null)
const callbackCache = []
const CLIENT_NORMAL_MSG = 'CLIENT_NORMAL_MSG' // 渲染进程发出消息类型
const CRAWLER_NORMAL_MSG = 'CRAWLER_NORMAL_MSG' // 主进程发出消息类型
ipcService.install = Vue => {
  Vue.prototype.$ipc = {
    send: (msgType, msgData) => {
      ipcRenderer.send(CLIENT_NORMAL_MSG, {
        type: msgType,
        data: msgData
      })
    },
    on: (type, callback) => {
      callbackCache.push({
        type,
        callback
      })
    }
  }
  ipcRenderer.on(CRAWLER_NORMAL_MSG, (sender, msg) => {
    callbackCache.forEach(cache => {
      if (cache.type === msg.type) {
        cache.callback && cache.callback(msg.data)
      }
    })
  }) // 监听主进程的消息
}

export default ipcService

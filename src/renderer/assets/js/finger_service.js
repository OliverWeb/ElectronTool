// 加载数据库
// 加载模块
import { evil } from './common'
import path from 'path'
// import { remote } from 'electron'

const Nedb = require('nedb')
// 实例化连接对象（不带参数默认为内存数据库）
// 数据存放位置 C:\Users\Boy\AppData\Roaming\Electron\SixEarDB\
const db = new Nedb({
  filename: path.join(__static, './db/finger_service.db'),
  autoload: true,
  timestampData: true
})

// 插入
function serviceSave (data) {
  let res = new Promise((resolve, reject) => {
    db.insert(data,
      (err, ret) => {
        if (err) {
          reject(err)
        } else {
          resolve(ret)
        }
      })
  })
  return res
}

// 查询
function serviecSearch (data) {
  let res
  res = new Promise((resolve, reject) => {
    let filter = {}
    if (data) {
      filter = {name: evil(`/${data}/i`)}
    }
    db.find(filter)
      .sort({name: 1})
      .limit(300)
      .exec((err, ret) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            data: ret
          })
        }
      })
  })
  return res
}

export default {
  install: function (Vue) {
    Vue.prototype.$serviceSave = (data) => serviceSave(data)
    Vue.prototype.$serviecSearch = (data) => serviecSearch(data)
  }
}

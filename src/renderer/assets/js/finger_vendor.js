// 加载数据库
// 加载模块
import { evil, readFile, writeFile } from './common'
import path from 'path'
import { remote } from 'electron'

// import finger_vender from '../../../../static/db/finger_vendor'
/*
* 1.首先,判断本地是否有这个finger_db数据库文件,如果有的不进行重新的写入了
*
* */

const Nedb = require('nedb')
// 实例化连接对象（不带参数默认为内存数据库）
// 数据存放位置 C:\Users\Boy\AppData\Roaming\Electron\SixEarDB\
const db = new Nedb({
  filename: path.join(path.join(remote.app.getPath('userData'), 'db/finger_vendor.db')),
  autoload: true,
  timestampData: true
})
// 插入
function vendorSave (data) {
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
function vendorSearch (data, accurate) {
  let res
  res = new Promise((resolve, reject) => {
    let filter = {}
    if (accurate) {
      filter = {vendor: data}
    } else if (data) {
      filter = {vendor: evil(`/${data}/i`)}
    }
    db.find(filter)
      .sort({vendor: 1})
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
;(async () => {
  let data = await vendorSearch()
  if (!(data && data.length > 1)) {
    let finger_db = await readFile(path.join(remote.app.getPath('userData'), 'db/finger_vendor.db'))
    if (finger_db) {
      return false
    } else {
      let finger_vendor = await readFile(path.join(__static, './db/finger_vendor.db'))
      let writeReuslt = await writeFile(path.join(remote.app.getPath('userData'), 'db/finger_vendor.db'), finger_vendor)
      console.log(writeReuslt)
    }
  }
})()

export default {
  install: function (Vue) {
    Vue.prototype.$vendorSave = (data) => vendorSave(data)
    Vue.prototype.$vendorSearch = (data) => vendorSearch(data)
  }
}

// 加载数据库 103.214.68.139   8989
// 加载模块
import path from 'path'
import { evil } from './common'
import { remote } from 'electron'

const Nedb = require('nedb')

// 实例化连接对象（不带参数默认为内存数据库）
// 数据存放位置 C:\Users\Boy\AppData\Roaming\Electron\db\
const db = new Nedb({
  filename: path.join(remote.app.getPath('userData'), 'db/plugin.db'),
  autoload: true
})

let time = () => parseInt(new Date().getTime() / 1000)

// 插入
function savePlugin (data) {
  if (data._id) { // 进行修改的保存
    let res
    res = new Promise((resolve, reject) => {
      db.update({_id: data._id}, {$set: {...data, update_time: time()}},
        (err, numremove) => {
          if (err) {
            reject(err)
          } else {
            resolve({...data})
          }
        })
    })
    return res
  } else { // 创建时期
    let res = new Promise((resolve, reject) => {
      db.insert({...data, create_time: time(), update_time: time()},
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
}
// 云插入数据
function saveCloudPlugin (data) {
  let res = new Promise((resolve, reject) => {
    db.insert({...data},
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
function searchPlugin (data) {
  let res, total
  res = new Promise((resolve, reject) => {
    let filter = {}
    if (data.name) {
      filter = {name: evil(`/${data.name}/i`)}
    }
    if (data._id) {
      filter = {_id: data._id}
    }
    // 待优化,不确定
    db.count(filter, (err, count) => {
      if (err) {
        reject(err)
      } else {
        total = count
      }
    })
    db.find(filter)
      .sort({update_time: -1})
      .limit(data.page_size)
      .skip(Number(data.page_num - 1) * data.page_size)
      .exec((err, ret) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            data: ret,
            total: total
          })
        }
      })
  })
  return res
}
function findOnePlugin (param) {
  return new Promise((resolve, reject) => {
    db.findOne({ ...param }, function (err, doc) {
      if (err) reject(err)
      resolve(doc)
    })
  })
}

// 删除
function removePlugin (data) {
  let res
  let filter = {}
  if (data._id) filter = {_id: data._id}
  res = new Promise((resolve, reject) => {
    db.remove({...filter}, {multi: true}, (err, numremove) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          numremove,
          _id: data._id
        })
      }
    })
  })
  return res
}

// 更改数据
function updatePlugin (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data, update_time: time()}},
      (err, numremovePlugind) => {
        if (err) {
          reject(err)
        } else {
          resolve(numremovePlugind)
        }
      })
  })
  return res
}
// 发布到六耳保存六耳id
function saveSixIdPlugin (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data}},
      (err, numremovePlugind) => {
        if (err) {
          reject(err)
        } else {
          resolve(numremovePlugind)
        }
      })
  })
  return res
}
// 云更新数据
function updateCloudPlugin (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data}},
      (err, numremovePlugind) => {
        if (err) {
          reject(err)
        } else {
          resolve(numremovePlugind)
        }
      })
  })
  return res
}
// 导入JSON进行覆盖本地
function updateJsonPlugin (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data, create_time: time(), update_time: time()}},
      (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          resolve(numRemoved)
        }
      })
  })
  return res
}
// 保存倒入JSON
function saveJsonPlugin (data) {
  let res = new Promise((resolve, reject) => {
    db.insert({...data, create_time: time(), update_time: time()},
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
export default {
  install: function (Vue) {
    Vue.prototype.$savePlugin = (data) => savePlugin(data)
    Vue.prototype.$searchPlugin = (data) => searchPlugin(data)
    Vue.prototype.$findOnePlugin = (param) => findOnePlugin(param)
    Vue.prototype.$removePlugin = (data) => removePlugin(data)
    Vue.prototype.$updatePlugin = (data) => updatePlugin(data)
    Vue.prototype.$updateCloudPlugin = (data) => updateCloudPlugin(data)
    Vue.prototype.$saveCloudPlugin = (data) => saveCloudPlugin(data)
    Vue.prototype.$saveSixIdPlugin = (data) => saveSixIdPlugin(data)
    Vue.prototype.$updateJsonPlugin = (data) => updateJsonPlugin(data)
    Vue.prototype.$saveJsonPlugin = (data) => saveJsonPlugin(data)
  }
}

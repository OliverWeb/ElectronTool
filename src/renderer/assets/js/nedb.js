// 加载数据库 103.214.68.139   8989
// 加载模块
import path from 'path'
import { evil } from './common'
import { remote } from 'electron'

const Nedb = require('nedb')

// 实例化连接对象（不带参数默认为内存数据库）
// 数据存放位置 C:\Users\Boy\AppData\Roaming\Electron\db\
// C:\Users\Boy\AppData\Roaming\sixear-client\db
const db = new Nedb({
  filename: path.join(remote.app.getPath('userData'), 'db/finger.db'),
  autoload: true
})

let time = () => parseInt(new Date().getTime() / 1000)

// 插入
function save (data) {
  if (data._id) { // 进行修改的保存
    let res
    res = new Promise((resolve, reject) => {
      db.update({_id: data._id}, {$set: {...data, update_time: time()}},
        (err, numRemoved) => {
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
function saveCloud (data) {
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
function search (data) {
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
function findOne (param) {
  return new Promise((resolve, reject) => {
    db.findOne({ ...param }, function (err, doc) {
      if (err) reject(err)
      resolve(doc)
    })
  })
}

// 删除
function remove (data) {
  let res
  let filter = {}
  if (data._id) filter = {_id: data._id}
  res = new Promise((resolve, reject) => {
    db.remove({...filter}, {multi: true}, (err, numRemoved) => {
      if (err) {
        reject(err)
      } else {
        resolve(numRemoved)
      }
    })
  })
  return res
}

// 更改数据
function update (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data, update_time: time()}},
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
// 发布到六耳保存六耳id
function saveSixId (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data}},
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
// 云更新数据
function updateCloud (data) {
  let res
  res = new Promise((resolve, reject) => {
    db.update({_id: data._id}, {$set: {...data}},
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
// 导入JSON进行覆盖本地
function updateJson (data) {
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
function saveJson (data) {
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
// 只更新日志数据
// function updateLog (data) {
//   let res
//   res = new Promise((resolve, reject) => {
//     db.update({_id: data._id}, {$set: {...data}},
//       (err, numRemoved) => {
//         if (err) {
//           reject(err)
//         } else {
//           resolve(numRemoved)
//         }
//       })
//   })
//   return res
// }

export default {
  install: function (Vue) {
    Vue.prototype.$save = (data) => save(data)
    Vue.prototype.$search = (data) => search(data)
    Vue.prototype.$findOne = (param) => findOne(param)
    Vue.prototype.$remove = (data) => remove(data)
    Vue.prototype.$update = (data) => update(data)
    // Vue.prototype.$updateLog = (data) => updateLog(data)
    Vue.prototype.$updateCloud = (data) => updateCloud(data)
    Vue.prototype.$saveJson = (data) => saveJson(data)
    Vue.prototype.$updateJson = (data) => updateJson(data)
    Vue.prototype.$saveCloud = (data) => saveCloud(data)
    Vue.prototype.$saveSixId = (data) => saveSixId(data)
  }
}

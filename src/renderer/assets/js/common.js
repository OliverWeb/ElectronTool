import fs from 'fs'
import store from '../../store/index'
// import axios from 'axios'
process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser
let request = require('request')
let Buffer = require('safe-buffer').Buffer
// var Base64 = require('js-base64').Base64
// let path = require('path')
function evil (regex) {
  let Fn = Function // 一个变量指向Function，防止有些前端编译工具报错
  return new Fn('return ' + regex)()
}

let readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(filePath, 'utf8',
        function (err, data) {
          if (err) throw err
          resolve(data)
        })
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}
let writeFile = (filePath, content) => {
  /*
  * flag: 'w' 追加内容进行写入
  * */
  return new Promise((resolve, reject) => {
    let bufferResult = new Buffer(content)
    fs.writeFile(filePath,
      bufferResult, {flag: 'w'}, function (err) {
        if (err) {
          console.error(err)
        } else {
          resolve(true)
        }
      })
  })
}

function geFileList (path) {
  var filesList = []
  var targetObj = {}
  readFilePath(path, filesList, targetObj)
  return filesList
}

// 遍历读取文件
function readFilePath (path, filesList, targetObj) {
  let files = fs.readdirSync(path)// 需要用到同步读取
  files.forEach(walk)

  function walk (file) {
    let states = fs.statSync(path + '/' + file)
    if (states.isDirectory()) {
      var item
      if (targetObj['children']) {
        console.log(targetObj['children'])
        item = {label: file, children: []}
        targetObj['children'].push(item)
      } else {
        item = {label: file, children: []}
        filesList.push(item)
      }
      console.log(item)
      console.log(filesList)
      readFilePath(path + '/' + file, filesList, item)
    } else {
      // 创建一个对象保存信息
      var obj = {}
      obj.size = states.size// 文件大小，以字节为单位
      obj.label = file// 文件名
      obj.path = path + '/' + file // 文件绝对路径
      if (file !== 'main.zip') {
        if (targetObj['children']) {
          var item1 = {label: file, value: obj.path}
          targetObj['children'].push(item1)
        } else {
          var item2 = {label: file, value: obj.path}
          filesList.push(item2)
        }
      }
    }
  }
}

function deleteFolder (path) {
  var files = []
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      files = fs.readdirSync(path)
      files.forEach(function (file, index) {
        var curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolder(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.unlinkSync(path)
    }
  }
}

function copyFolder (from, to) { // 复制文件夹到指定目录
  let files = []
  if (fs.existsSync(to)) { // 文件是否存在 如果不存在则创建
    files = fs.readdirSync(from)
    files.forEach(function (file, index) {
      var targetPath = from + '/' + file
      var toPath = to + '/' + file
      if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
        copyFolder(targetPath, toPath)
      } else { // 拷贝文件
        fs.copyFileSync(targetPath, toPath)
      }
    })
  } else {
    fs.mkdirSync(to)
    copyFolder(from, to)
  }
}

// 漏洞插件mapx_min验证单个请求

async function testOne (form, url, vars) {
  // console.log(form.request.uri.match(reg))
  let uri = form.request.uri
  if (form.request.uri) {
    uri = varToStr(form.request.uri, vars)
  }
  var config = {
    uri: url + uri,
    method: form.request.method,
    followRedirect: form.request.hop
  }

  if (form.request.headers) {
    config.headers = JSON.parse(varToStr(form.request.headers, vars))
  }
  if (form.request.data) {
    config.body = varToStr(form.request.data, vars)
  }
  console.log(config)
  let isOk
  await http(config, form, vars)
    .then(res => {
      console.log(res)
      isOk = res
    })
    .catch(() => {
      isOk = {
        res: false,
        code: ''
      }
      // isOk = false
    })

  return isOk
}

function http (config, form, vars) {
  if (store.state.proxy && !!store.state.isProxy) {
    request = request.defaults({'proxy': store.state.proxy})
  } else {
    request = request.defaults({'proxy': null})
  }
  // console.log(request)
  return new Promise(function (resolve, reject) {
    request(config, async (err, res) => {
      // console.log(err)
      // console.log(res)
      if (!err) {
        var headers = ''
        res.rawHeaders.forEach(function (val, i) {
          if (i % 2 === 0) {
            headers += val + ': '
          } else {
            headers += val + '\n'
          }
        })
        res.headersStr = headers
        let data = {
          res: getQueryData(form.response.query, res, vars),
          code: res
        }

        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function getQueryData (val, res, vars) {
  var arr = []
  for (let item of val.children) {
    if (item.type === 'query-builder-rule') {
      let data
      if (item.query.rule === 'code') {
        data = res.statusCode.toString()
      } else if (item.query.rule === 'headers') {
        data = res.headersStr
        // data = JSON.stringify(res.headers)
      } else if (item.query.rule === 'body') {
        data = res.body
      }
      let newVal = varToStr(item.query.value, vars)
      let isOk = judge(item.query.selectedOperator, newVal, data)
      arr.push(isOk)
    } else {
      arr.push(getQueryData(item.query, res))
    }
  }
  // console.log(arr)
  let isPass
  if (arr.length > 0) {
    if (val.logicalOperator === '与') {
      isPass = arr.toString().indexOf('false') < 0
    } else {
      isPass = arr.toString().indexOf('true') >= 0
    }
  } else {
    isPass = true
  }
  // if (val.logicalOperator === '与') {
  //   isPass = arr.toString().indexOf('false') < 0
  // } else {
  //   isPass = arr.toString().indexOf('true') >= 0
  // }
  return isPass
}

function judge (ope, val, res) {
  switch (ope) {
    case '等于':
      return val === res
    case '不等于':
      return val !== res
    case '包含':
      return res.indexOf(val) >= 0
    case '不包含':
      return res.indexOf(val) < 0
    case '正则表达式':
      return new RegExp(val, 'i').test(res)
    case '开头':
      return res.indexOf(val) === 0
    case '结尾':
      let d = res.length - val.length
      return d >= 0 && res.lastIndexOf(val) === d
    case '大于':
      return res > val
    case '小于':
      return res < val
    case '大于等于':
      return res >= val
    case '小于等于':
      return res <= val
  }
}

// function hexToStr (hexCharCodeStr) {
//   var trimedStr = hexCharCodeStr.trim()
//   var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr
//   var len = rawStr.length
//   if (len % 2 !== 0) {
//     alert('Illegal Format ASCII Code!')
//     return ''
//   }
//   var curCharCode
//   var resultStr = []
//   for (var i = 0; i < len; i = i + 2) {
//     curCharCode = parseInt(rawStr.substr(i, 2), 16) // ASCII Code Value
//     resultStr.push(String.fromCharCode(curCharCode))
//   }
//   return resultStr.join('')
// }
let sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})
async function getStepData (data, url, checks) {
  var arr = []
  var vars = {}
  for (let item of data.children) {
    if (item.children && (item.children.length > 0)) { // 组
      await getStepData(item, url, checks)
        .then(res => {
          arr.push(res)
        })
        .catch(err => {
          console.log(err)
        })
    } else if (!item.relation) {
      item.pass = ''
      let testData = checks[item.id]
      if (testData.request.uri && testData.request.uri === '$sleep') {
        let time = Number(testData.request.data) * 1000
        await sleep(time)
        item.pass = '通过'
      } else {
        await testOne(checks[item.id], url, vars)
          .then(res => {
            arr.push(res.res)
            item.pass = res.res ? '通过' : '未通过'
            let varData = getVars(res.code, checks[item.id], vars)
            vars = Object.assign({}, vars, varData)
          })
          .catch(err => {
            console.log(err)
          })
      }
    }
  }
  let isPass
  if (arr.length > 0) {
    if (data.relation === 'AND') {
      isPass = arr.toString().indexOf('false') < 0
    } else {
      isPass = arr.toString().indexOf('true') >= 0
    }
  } else {
    isPass = true
  }

  return {
    res: isPass,
    vars: vars
  }
}
// 处理自定义变量
function getVars (data, form, vars) {
  var oldVars = vars
  var varsData = {}
  for (let item of form.response.vars) {
    if (item.name) {
      let newVal
      if (item.from === 'headers') {
        // console.log(data.headersStr.match(new RegExp(newVal, 'i')))
        newVal = varToStr(item.value, oldVars)
        let val1 = data.headersStr.match(new RegExp(newVal, 'i'))
        varsData[item.name] = val1 ? val1[1] : ''
      } else if (item.from === 'StatusCode') {
        varsData[item.name] = data.statusCode
      } else {
        // console.log(data.body.match(new RegExp(item.value)))
        newVal = varToStr(item.value, oldVars)
        let val2 = data.body.match(new RegExp(newVal, 'i'))
        varsData[item.name] = val2 ? val2[1] : ''
      }
    }
    oldVars = Object.assign({}, oldVars, varsData)
  }
  // console.log(varsData)
  return varsData
}
// 获取自定义变量
function varToStr (str, vars) {
  let reg = /{\$([a-zA-Z0-9_-]+)}/ig
  let urlVars = str.match(reg)
  let res = str
  if (urlVars !== null) {
    for (let item of urlVars) {
      res = res.replace(item, vars[item.slice(2, -1)])
    }
  }
  return res
}
let Storage = {
  setItem: function (k, v) {
    let se = document.createEvent('StorageEvent')
    se.initStorageEvent('storage', false, false, k, localStorage.getItem(k), v,
      '', '')
    window.dispatchEvent(se)
    localStorage.setItem(k, v)
  }
}

export {
  evil,
  readFile,
  writeFile,
  geFileList,
  deleteFolder,
  copyFolder,
  testOne,
  getStepData,
  getVars,
  Storage
}

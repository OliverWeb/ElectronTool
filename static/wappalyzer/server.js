'use strict'
import wappalyzer from './wappalyzer'
var jschardet = require('jschardet')
var encoding = require('encoding')
let iconv = require('iconv-lite')

let appsJson = ''
let reusltD = ''
process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser
var request = require('request')
var fs = require('fs')
var path = require('path')

function detectFromUrl (options, cb,appJson) {
  if (options.debug) {
    console.log('Fetching the page')
  }

  getHTMLFromUrl(options, function (err, data) {
    if (err || data === null) {
      cb(err, null,appJson)
    } else {
      runWrappalyer(options, data, function (err, detected, appInfo) {
         cb(null, detected, appInfo)
      },appJson)
    }
  })
}

function getHTMLFromUrl (options, cb) {
  // response, body 中包含哪些信息呢？
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  request(options, function (error, response, body) {
    let info = jschardet.detect(body)
    let resultBuffer = encoding.convert(body, 'UTF-8', info.encoding)
    body = iconv.decode(resultBuffer, 'UTF-8')
    if (!error) {
      var data = {
        url: options.url,
        headers: response.headers
      }
      if (response.statusCode == 200) {
        data.html = body
      }
      cb(null, data)
    } else {
      cb(error, null)
    }
  })
}

function getAppsJson (cb,appJson) {
  // fs.readFile(path.resolve(__static, './wappalyzer/apps.json'), 'utf8',
  //   //   function (err, data) {
  //   //     if (err) throw err
  //   //
  //   //   })
  return cb(null, JSON.parse(appJson))
}

function runWrappalyer (options, data, cb,appJson) {
  var debug = options.debug || false

  // var wappalyzer = require('./wappalyzer').wappalyzer
  getAppsJson(function (err, apps) {
    var w = wappalyzer
    w.driver = {
      log: function (args) {
        if (debug) {
          console.log(args.message)
        }
      },

      init: function () {
        w.categories = apps.categories
        w.apps = apps.apps
      },
      displayApps: function () {
        var app, url = Object.keys(w.detected)[0]
        var detectedApps = []

        for (app in w.detected[url]) {
          // 获取分类信息
          let numCats = w.apps[app].cats
          let strCats = []

          if (numCats) {
            numCats.forEach(cat => {
              strCats.push(w.categories[cat])
            })
          }
          w.detected[url][app].category = strCats

          detectedApps.push(app)

          if (debug) {
            console.log(app)
          }
        }
        cb(null, detectedApps, w.detected[url])   // 将这个数据拿出去
      }
    }
    w.init()
    w.detected = []
    w.analyze(options.hostname, options.url, data)
  },appJson)
}

function _check_fingerprint (targetURL,res,appJson) {
  var options = {
    url: targetURL,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
    },
    debug: false,
    maxRedirects: 5,
    // 禁止跳转，防SSRF
    followRedirect: false,
    timeout: 10000
  }

  var beginTime = Date.now()

  detectFromUrl(options, function (err, apps, appInfo) {
    // console.log(apps)
    var details = {}
    if(apps){
      apps.forEach(name => {
      var appDetail = appInfo[name]
      details[name] = {
        versions: appDetail['versions'],
        category: appDetail['category'],
        confidence: appDetail['confidenceTotal']
      }
    })
    }


    // 单位毫秒
    var elapsedTime = Date.now() - beginTime

     res(JSON.stringify({
       status: 'success',
       elapsed_time: elapsedTime,
       data: {
         apps: apps,
         details: details
       }
     }))
  },appJson)
}

export default function checkFP (targetURL,appJson) {
  return new Promise((resolve, reject) => {
    _check_fingerprint(targetURL,function (result) {
      resolve(result)
    },appJson)
  })
}

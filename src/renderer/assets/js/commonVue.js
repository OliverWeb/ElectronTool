import Vue from 'vue'
import JsEncrypt from 'jsencrypt/bin/jsencrypt'
// import JSEncrypt from 'jsencrypt-rsa'
import checkFP from '../../../../static/wappalyzer/server'
import { remote } from 'electron'
// import { Base64 } from 'js-base64'

const sm2 = require('miniprogram-sm-crypto').sm2

let fs = require('fs')
let path = require('path')

Vue.use(require('vue-electron'))
const {BrowserWindow, shell} = Vue.prototype.$electron.remote

// 创建新窗口
function creatNewWin (path) {
  let winArr = BrowserWindow.getAllWindows()
  console.log(winArr)
  if (winArr.length === 2) {
    winArr[1].show()
    return false
  }
  const modalPath = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/${path}`
    : `file://${__dirname}/index.html#${path}`
  let win = new BrowserWindow({
    width: 1000,
    height: 700,
    useContentSize: true,
    webPreferences: {
      webSecurity: false
    }
  })
  win.loadURL(modalPath)
  win.on('closed', () => {
    win = null
  })
}

// 打开默认浏览器
function open (link) {
  shell.openExternal(link)
}

function formatTime (timestamp) {
  let date
  if (timestamp < 10000000000) {
    date = new Date(timestamp * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘
  } else {
    date = new Date(timestamp)
  }
  let Y = date.getFullYear() + '-'
  let M = (date.getMonth() + 1 < 10
    ? '0' + (date.getMonth() + 1)
    : date.getMonth() + 1) + '-'
  let D = date.getDate() < 10
    ? '0' + date.getDate()
    : date.getDate()
  let h = (date.getHours() < 10
    ? '0' + date.getHours()
    : date.getHours()) + ':'
  let m = (date.getMinutes() < 10
    ? '0' + date.getMinutes()
    : date.getMinutes()) + ':'
  let s = date.getSeconds() < 10
    ? '0' + date.getSeconds()
    : date.getSeconds()
  let time = {
    date: Y + M + D,
    time: h + m + s,
    dateTime: Y + M + D + ' ' + h + m + s,
    year: Y
  }
  return time
}

function evil (regex) {
  let Fn = Function // 一个变量指向Function，防止有些前端编译工具报错
  return new Fn('return ' + regex)()
}

/* 加密解密区块 start */
// function b64tohexFun (str) {
//   var b64pad = '='
//   var b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
//   var BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz'
//
//   function int2char (n) {
//     return BI_RM.charAt(n)
//   }
//
//   function b64tohex (s) {
//     var ret = ''
//     var i
//     var k = 0 // b64 state, 0-3
//     var slop = 0
//     for (i = 0; i < s.length; ++i) {
//       if (s.charAt(i) === b64pad) {
//         break
//       }
//       var v = b64map.indexOf(s.charAt(i))
//       if (v < 0) {
//         continue
//       }
//       if (k === 0) {
//         ret += int2char(v >> 2)
//         slop = v & 3
//         k = 1
//       } else if (k === 1) {
//         ret += int2char((slop << 2) | (v >> 4))
//         slop = v & 0xf
//         k = 2
//       } else if (k === 2) {
//         ret += int2char(slop)
//         ret += int2char(v >> 2)
//         slop = v & 3
//         k = 3
//       } else {
//         ret += int2char((slop << 2) | (v >> 4))
//         ret += int2char(v & 0xf)
//         k = 0
//       }
//     }
//     if (k === 1) {
//       ret += int2char(slop << 2)
//     }
//     return ret
//   }
//   return b64tohex(str).length
// }

/* 加密解密区块 end */
let public_key = '094d8f2e89c5707d20e11b6a9aae4a64aa5878888289b824f4c6a7f85398db89b90e2b5bb653383d8223088103c4d706a3d60bf6f76a1779d8b89d4daa7b755b'
const cipherMode = 1 // 1 - C1C3C2，0 - C1C2C3，默认为1
function sm2Encrypt (str) {
  return sm2.doEncrypt(str, public_key, cipherMode)
}

let key = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDd6vh4pc3RAgBhukY9K5pVovJv
+VBIwC0Js8SnV5EuyTMMqzPF+WSiea47a12uLB4ejGIyu5j7CKbRZaV2ObAlQYd+
6eOzE0RkRbXZKNIVVB/Y3OwP4/LvIRlqXN2bTSYAZE2dCq3+qIvmXgk8s8W225Nf
tOnbTrM0gbBm3bPtxwIDAQAB
-----END PUBLIC KEY-----`
let key2 = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDd6vh4pc3RAgBhukY9K5pVovJv+VBIwC0Js8SnV5EuyTMMqzPF
+WSiea47a12uLB4ejGIyu5j7CKbRZaV2ObAlQYd+6eOzE0RkRbXZKNIVVB/Y3OwP
4/LvIRlqXN2bTSYAZE2dCq3+qIvmXgk8s8W225NftOnbTrM0gbBm3bPtxwIDAQAB
AoGBAKqlE5najZCJxHdhwL8q90uguGJoSVcYB8ntJWw0xtw+NPYp8+7pXnwdq1/f
qLLVE/gTpTMz1Gg89+IPEpP9ujcNGKXXcLQDiThb/7l6a32KCvvhfPiogP0X1lkS
XNK1lJ6c3MI2a17Al38Dk93rKnS7aZWz3RSNA701qzh+bJOBAkEA51WPLWGfIdBG
VvErwqljmdY54IT3QidXFjCxf0ydlrNkpFrvFwNhg+tm5tGDw8V0gJMrpwSNwYXn
5sWi5Y2dwQJBAPWUYnhHEqq6/zLIPv4RSVLRcmxFuIIhEeELK0+zjyhOY1CpUM5y
yQNVDHJpp65XgFsfAIL7k3hmGJsENv6e/YcCQBSnK9g2Xfmr2YvLjkebzdufJ52m
4VhToM/HWyFtWqhorbSKtcvNLniTnKVA0U26JDOScBRCMNG1PcX5oRhzc0ECQEy8
JuCqZJzQfXlitLwyrpSgOX63cmXG641ELi5jTvIrPEEyBrvbhg/yfUcq2GhTkxnl
4AUNkxDl5f5aHM0G5PUCQQC8gzWxhU84O46+aJQnanm2blmRWjspnbCcW5a4PL1Y
R64R0rQQKn3C2y9oh0k0nZoEpaeLe4zed2Vzk9UjA44M
-----END RSA PRIVATE KEY-----`

function encrypt (str, Pkey) {
  let jse = new JsEncrypt()
  jse.setPublicKey(Pkey)
  return jse.encrypt(str)
}

function decrypt (str, Pkey) {
  var decrypt = new JsEncrypt()
  decrypt.setPrivateKey(Pkey)
  return decrypt.decrypt(str)
}
function testEncrypt (str) {
  var encrypt = new JsEncrypt()
  encrypt.setPublicKey(`
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRmqsafzB0yxgmQQOBPEGHCLxB
lODEi8sU1JnKRclGnK/YaGgEQSBJPHLCKfomeYvhw7warpriOi2VD0nmWr3qNF6a
M7L63FIt2ViMsMBJgu8THYGUuKa2Qhk09M8nSC04R+RJi11N2DnBtbI9ZEuvRAzT
SRmJVTj99ptdViNzGwIDAQAB
-----END PUBLIC KEY-----
`)
  return encrypt.encryptLong2(str)
}

function testDecrypt (str, Pkey) {
  var decrypt = new JsEncrypt()
  decrypt.setPrivateKey(`
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDRmqsafzB0yxgmQQOBPEGHCLxBlODEi8sU1JnKRclGnK/YaGgE
QSBJPHLCKfomeYvhw7warpriOi2VD0nmWr3qNF6aM7L63FIt2ViMsMBJgu8THYGU
uKa2Qhk09M8nSC04R+RJi11N2DnBtbI9ZEuvRAzTSRmJVTj99ptdViNzGwIDAQAB
AoGAFiNp8xCAA7X3xQKU5i+BFEwd5iddXiUNvBOActbQHX8rK4ZLhjeCu3mA/XUF
kM7BsYTE92R9w2s1qUrGGWh4KnWQf9DDv95yRQEQ5tna3TVWsnjmt4bP+UB2su2M
3DFg1czJlFQ17VWEcwGBmAxYScWlMbFdra8a7yPzAaXWNUECQQDjUdtMSB8QPJTf
f4HzGtnvYMYj9d0+xW+79rhE75wiyOwguomHVliTFk2AtT9mERi+JRuYjpn0Rsuq
U67H53ArAkEA7Aye50kbLgL6akf+4MqHKhUTXopxhUoVnZWHQUzgWOinqgilP1bb
/m8aVrHunDXGmqd28p5ZfhD1KyMoM0Kg0QJAJ8RlMeYYERYYETVUPXxADgGHCDl1
2ApgLqjNubmVPfyaWmtnrdZsLmcjbdXHXoq1ImaJelnQEwzjikuTcwNI+wJBAL5c
Xzm+Z0Dv/esALLg0HFT/siMoGuyXFl+DWxR6XuLUnYIufrVZ4wiJqQAJdphbddL7
Ap4evaVBH7auH5lXPkECQBAcLNO5KuypUj0PpvzGfudzaIK5syfw/fJ/IFOvTT1S
yc/HUxWiZI6v1fh8NXh4LVUW/9kKH0bG6+XH79PHZ5A=
-----END RSA PRIVATE KEY-----
`)
  return decrypt.decryptLong2(str)
}

function StrEncrypt (string) { // 对密码长度较长的进行加密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 25) {
      arr = string.match(/.{1,25}/g)
      for (let i in arr) {
        // res += getEncryptStr(arr[i], key, 50)
        res += encrypt(arr[i], key)
      }
    } else {
      res = encrypt(string, key)
    }
    return res
  }
}

function StrDecrypt (string) { // 对文件的导出进行的解密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 172) {
      arr = string.match(/.{1,172}/g)
      // console.log(string)
      // console.log(JSON.stringify(arr))
      for (let i in arr) {
        // console.log(arr[i])
        res += decrypt(arr[i], key2)
      }
    } else {
      res = decrypt(string, key2)
    }
    return res
  }
}

let clientpub = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRmqsafzB0yxgmQQOBPEGHCLxB
lODEi8sU1JnKRclGnK/YaGgEQSBJPHLCKfomeYvhw7warpriOi2VD0nmWr3qNF6a
M7L63FIt2ViMsMBJgu8THYGUuKa2Qhk09M8nSC04R+RJi11N2DnBtbI9ZEuvRAzT
SRmJVTj99ptdViNzGwIDAQAB
-----END PUBLIC KEY-----`
let clientpri = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDRmqsafzB0yxgmQQOBPEGHCLxBlODEi8sU1JnKRclGnK/YaGgE
QSBJPHLCKfomeYvhw7warpriOi2VD0nmWr3qNF6aM7L63FIt2ViMsMBJgu8THYGU
uKa2Qhk09M8nSC04R+RJi11N2DnBtbI9ZEuvRAzTSRmJVTj99ptdViNzGwIDAQAB
AoGAFiNp8xCAA7X3xQKU5i+BFEwd5iddXiUNvBOActbQHX8rK4ZLhjeCu3mA/XUF
kM7BsYTE92R9w2s1qUrGGWh4KnWQf9DDv95yRQEQ5tna3TVWsnjmt4bP+UB2su2M
3DFg1czJlFQ17VWEcwGBmAxYScWlMbFdra8a7yPzAaXWNUECQQDjUdtMSB8QPJTf
f4HzGtnvYMYj9d0+xW+79rhE75wiyOwguomHVliTFk2AtT9mERi+JRuYjpn0Rsuq
U67H53ArAkEA7Aye50kbLgL6akf+4MqHKhUTXopxhUoVnZWHQUzgWOinqgilP1bb
/m8aVrHunDXGmqd28p5ZfhD1KyMoM0Kg0QJAJ8RlMeYYERYYETVUPXxADgGHCDl1
2ApgLqjNubmVPfyaWmtnrdZsLmcjbdXHXoq1ImaJelnQEwzjikuTcwNI+wJBAL5c
Xzm+Z0Dv/esALLg0HFT/siMoGuyXFl+DWxR6XuLUnYIufrVZ4wiJqQAJdphbddL7
Ap4evaVBH7auH5lXPkECQBAcLNO5KuypUj0PpvzGfudzaIK5syfw/fJ/IFOvTT1S
yc/HUxWiZI6v1fh8NXh4LVUW/9kKH0bG6+XH79PHZ5A=
-----END RSA PRIVATE KEY-----`

// 导入导出文件加密.
let keypri = '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIICXQIBAAKBgQDfYAAR7hxhgw0iUlohQ/CTk3R6KFimCXeiidpQsdZIE3ZuYsHn\n' +
  'mm3BMkhe/TDc9CWQHTPBea+UhArO4W1wvEAsjPBB+SqehEnnqyHX4dXF+l2ax/9F\n' +
  '9TpdYnJvk76WHJe0TDk5e5LAnXr1R6XqTA2vXKmOrrmbly30gVho1ulw9QIDAQAB\n' +
  'AoGBAJ3bD/Gb3f6jSGLa48riYl9IM2YooQ0lX6BD3z5rjsz8xBMaQ4HSxoFjcXV/\n' +
  'ZEqhVvJTUMIHpqdD8Qdmk5q5znbauFk65O0VoWO/l2CG1xX8lC2dlndsuP0z7CiK\n' +
  'TgqQA1Y3QQf9srEYLsHH7eYwgm2nrcjy5O9pKzlgNBISMk95AkEA/miM20Pdq2vZ\n' +
  '7/DiU+YEwmnUeULsVGU0mbMM6+GN24W56PGVlgtB1NpfceNKdthkI/dBw6ZIR5rt\n' +
  'NkPaD2QugwJBAODFv46Pzlpt1ooULrUbQGLBlYBLc32FUhpFP1rI8Mi/mzCvdi4l\n' +
  'R0tA8BhVxsQlnfH7HbiIZVobMIgQBg+hSScCQQCTq+o/CAiujR7m2ML3Aig3FSkA\n' +
  '7iix4EEFClpwvO8Twm6kWT6D5qriu5L1T4KUs4yFF+uzflysO7B/dCkqD/OzAkBB\n' +
  'YyVzmoAELHnB11czFkdnszsDhG+Hb1ZQEB77EQOC0sKZqiFuESgpSy3NVn6pJuxI\n' +
  'ra2atgsN6GT43/hzaY73AkAGcxmYKFmKJbVw4I2N5w36gXkk/ZQKz6/tOQJqJEia\n' +
  'i45hQ2nNhG6gkND1I4mBTLsu7pSEK73wuy50dqy+2Nla\n' +
  '-----END RSA PRIVATE KEY-----'
let keypul = '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfYAAR7hxhgw0iUlohQ/CTk3R6\n' +
  'KFimCXeiidpQsdZIE3ZuYsHnmm3BMkhe/TDc9CWQHTPBea+UhArO4W1wvEAsjPBB\n' +
  '+SqehEnnqyHX4dXF+l2ax/9F9TpdYnJvk76WHJe0TDk5e5LAnXr1R6XqTA2vXKmO\n' +
  'rrmbly30gVho1ulw9QIDAQAB\n' +
  '-----END PUBLIC KEY-----'

function DataEncrypt (string) { // 对上传六耳数据的进行加密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 25) {
      arr = string.match(/.{1,25}/g)
      for (let i in arr) {
        // res += getEncryptStr(arr[i], clientpub, 50)
        res += encrypt(arr[i], clientpub)
      }
    } else {
      res = encrypt(string, clientpub)
    }
    // let encrypt = new JSEncrypt()
    // encrypt.setPublicKey(clientpub)
    // let res = encrypt.encryptLong2(string)
    return res
  }
}

function DataDecrypt (string) { // 对文件的导出进行的解密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 172) {
      arr = string.match(/.{1,172}/g)
      // console.log(string)
      // console.log(JSON.stringify(arr))
      for (let i in arr) {
        // console.log(arr[i])
        res += decrypt(arr[i], clientpri)
      }
    } else {
      res = decrypt(string, clientpri)
    }
    // let encrypt = new JSEncrypt()
    // encrypt.setPublicKey(clientpri)
    // let res = encrypt.decryptLong2(string)
    return res
  }
}

function FileEncrypt (string) { // 对文件的导入和导出进行加密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 25) {
      arr = string.match(/.{1,25}/g)
      for (let i in arr) {
        res += encrypt(arr[i], keypul)
      }
    } else {
      res = encrypt(string, keypul)
    }
    return res
  }
}

function FileDecrypt (string) { // 对文件的导出进行的解密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 172) {
      arr = string.match(/.{1,172}/g)
      for (let i in arr) {
        res += decrypt(arr[i], keypri)
      }
    } else {
      res = decrypt(string, keypri)
    }
    return res
  }
}

let sixFilePri = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAs7SiRBJ7iy50LmhkaIScssr6RZ+ZLCHIV614eWbN0A1QO+T4
+44TbpfHqbX9qJTPLUarBRAOc+eAFta7LGqDuIc0FmVb9PZqn4zAvPpRYjG8TlS4
Y3SMFQ3b0P04cCuseM28mR+8JSyneOQq1S7u68Wk8JyBlXx4hdTlf8Lob1k/Meg7
CGFayJro6OJ0HBemJwHO4u6AcqwYkbcQgC/M/qdRV1s0wboDe/8Sg1Q6ZxkG9AnM
Br06qjcSIA1T6HFiCtZXsm1Y9s0bu8nSOkU5D74Jy8D8WV5XxPoIi4ULhZEox/7B
rLW89oHikD3w9Ron0dVZMLxm9VLY3cNs3XKTOQIDAQABAoIBAFaIltJ8q+z7c4qd
TixeHy6hOx6nmZR8uAIwUCD1dgnHP2l3+sT3Rzgr8kMwlXLGJXVB4DxR3QPG6BEX
WY4rxD3pLRXTvRIaToGBv5XAW8wS8wAtH5UUnBfPUpgyNykcfrK1Lyn09B5agFJg
XJfHP9lclO4gDu4yv76CI/j/m/lxi6XHTKBGFb473mjaxT9D8gx6Fd4U5GZQAYad
MsElXNV7FqYl+9Yz13SZlDI1PWSNGMegfmzgDa1IVz4YxMDCdFts0sQqCKNtEli7
oQtfiqqgW+C0hqFybijUQiKGrCpW4FsKqgyvHw26BKLeDYnQQz9CPq4TWSg4Qwyq
U7dQnFkCgYEAz6MM0y2PCJUUyOxYhWVEsLu6hmSdHpQBL5Lo5/ZQUJqK74qgQA8I
Wx5hleAMQghYXrKNv9y0l7wuO0Vn6+yBPjSZkHE8J3tglPJhDbc2A24x+tBu1GY2
fOefcvP00jn2os8pEZwKxYtSde9DStSVqY2Yc0El4wbcKhBUApGZPlsCgYEA3ZAZ
P6epRiTovvoMBDX2bhtPDT3eoBh8rDsnL2HhMIlcrVQ+umMZ5nfK4BwGgluVu9UY
5tJKOdoL2kpAZ4BRHlqmHq2kzLf5f+B66HCwYRw5s2/OgL6Y5DMUHYLa2VqiiErv
xGpYWwLz9ce3di+XYrz3KuK8/SlUT1UXBfQCUPsCgYAXuhkgFKewomCSqTdgXvcf
fwRMkTjHIsCT8CS/RQ1eeJqBzwSK7WzWBL3AA69C6HM4twytrQnSAQYDbeX3Nrp6
IkaeE+J83INn4d6nU5VPhQsfDyxrBxcY5Nr6ptgGIeuGJUgbJAqzEj2lDmdRKMPF
cVHHcd1jeQg1olIHTR4G2wKBgBnfauNhC8ZSJw+uGVsghg9jhv6v2+BsG5rtKW1C
C87kK3teHBkd23drQ7iZ7TSpxzlw8AB8TAinarzp8M1lUZOu2Dk648S4Mx14tEGS
bzZX2nEWvFGScD4trMqpbi71g4dQ4ODZ3kl6dcycrtLRSedQ07ghVBpoCh1dfVvH
m8GjAoGAMb+4V0bgdb8Fg+DS3A6xjzLE9LnsdUC9wxUe8ELZhgBHNINjaJxJWiNR
Zqb9OxzKoDF0FOQs5hbOPXPoAbLSih83XyWHwNBWCfVsDrE0rFnB+p+nyoBUhX8p
nzRVL0xKZBrEqjG1urcRYJukH43SJLOU8kHKB6MIpRgSDZBWfXs=
-----END RSA PRIVATE KEY-----`
let sixFilePub = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs7SiRBJ7iy50LmhkaISc
ssr6RZ+ZLCHIV614eWbN0A1QO+T4+44TbpfHqbX9qJTPLUarBRAOc+eAFta7LGqD
uIc0FmVb9PZqn4zAvPpRYjG8TlS4Y3SMFQ3b0P04cCuseM28mR+8JSyneOQq1S7u
68Wk8JyBlXx4hdTlf8Lob1k/Meg7CGFayJro6OJ0HBemJwHO4u6AcqwYkbcQgC/M
/qdRV1s0wboDe/8Sg1Q6ZxkG9AnMBr06qjcSIA1T6HFiCtZXsm1Y9s0bu8nSOkU5
D74Jy8D8WV5XxPoIi4ULhZEox/7BrLW89oHikD3w9Ron0dVZMLxm9VLY3cNs3XKT
OQIDAQAB
-----END PUBLIC KEY-----`

function SixFileEncrypt (string) { // 对密码长度较长的进行加密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 245) {
      arr = string.match(/.{1,245}/g)
      for (let i in arr) {
        // res += getEncryptStr(arr[i], sixFilePub, 50)
        res += encrypt(arr[i], sixFilePub)
      }
    } else {
      res = encrypt(string, sixFilePub)
    }
    return res
  }
}

function SixFileDecrypt (string) { // 对密码长度较长的进行加密
  if (string) {
    let arr = ''
    let res = ''
    if (string.length > 344) {
      arr = string.match(/.{1,344}/g)
      for (let i in arr) {
        res += decrypt(arr[i], sixFilePri)
      }
    } else {
      res = decrypt(string, sixFilePri)
    }
    return res
  }
}

// for (let i = 0; i < 10; i++) {   // 循环循环测试代码
//   let str1 = '+UwXEIG+wLwzN7fIIa8WVMC6MHkhWlazXOPOXW3A'
//   console.log(str1.length)
//   let str = DataEncrypt(str1)
//   console.log('加密===>' + str)
//   console.log('base64解密===>' + Base64.decode(str))
//   console.log('%c友情提示======>>>>>>>', 'color:red')
//   console.log(Base64.decode(str).length)
//   console.log(`加密长度${i}===>` + str.length)
//   let str2 = DataDecrypt(str)
//   console.log(str2)
//   if (str2.indexOf('==') !== -1) {
//     alert('==')
//   }
//   if (str1 !== str2) {
//     alert('bug')
//   }
// }

/* todo web识别指纹探测 start */
let handleReadFile = () => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(path.join(__static, './wappalyzer/apps.json'), 'utf8',
        function (err, data) {
          if (err) throw err
          resolve(JSON.parse(data))
        })
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

let pollingCheck = async (form, pollingArr, address, rec_name) => {
  let contentApps = await handleReadFile()
  let checkArr = {
    headers: [], html: [], url: [], script: [], meta: [], js: []
  }
  for (let key in pollingArr) {
    if (pollingArr[key] && pollingArr[key] !== '{}' &&
      JSON.stringify(pollingArr[key]) !== '{}') {
      if (key === 'headers' || key === 'meta' || key === 'js') {
        let obj
        try {
          // obj = JSON.parse(pollingArr[key].replace(/\\/g, '\\\\'))
          obj = JSON.parse(pollingArr[key])
          // obj = JSON.parse(pollingArr[key])
        } catch (e) {
          console.log(e)
          return false
        }
        // Object.keys(obj).forEach(async (i, index) => {})
        for (let i in obj) {
          let content = {...contentApps}
          content.apps = {
            identifyName: {
              [key]: {[i]: obj[i]}
            }
          }
          console.log(content)
          console.log(JSON.stringify(content))
          let response = await checkFP(address, JSON.stringify(content))
          console.log(response)
          let returnData = JSON.parse(response)
          if (returnData) {
            if (returnData.data.apps === null) {
              return null
            }
          }
          if (returnData && returnData.data && returnData.data.apps &&
            returnData.data.apps[0]) {
            // checkArr[key][index] = 'pass'
            checkArr[key].push('pass')
          } else {
            // checkArr[key][index] = 'unpass'
            checkArr[key].push('unpass')
          }
          content = {}
        }
      } else if (key === 'html' || key === 'script') {
        let arr = pollingArr[key]
        // arr.forEach(async (value, index) => {})  // todo forEach原生js
        for (let value in arr) {
          let content = {...contentApps}
          content.apps = {
            identifyName: {
              [key]: arr[value]
            }
          }
          // alert(JSON.stringify(content))
          console.log(JSON.stringify(content))
          let response = await checkFP(address, JSON.stringify(content))
          let returnData = JSON.parse(response)
          if (returnData) {
            if (returnData.data.apps === null) {
              return null
            }
          }
          if (returnData && returnData.data && returnData.data.apps &&
            returnData.data.apps[0]) {
            // checkArr[key][index] = 'pass'
            checkArr[key].push('pass')
          } else {
            // checkArr[key][index] = 'unpass'
            checkArr[key].push('unpass')
          }
          content = {}
        }
      } else if (key === 'url') {
        let content = {...contentApps}
        content.apps = {
          identifyName: {
            url: pollingArr[key]
          }
        }
        let response = await checkFP(address, JSON.stringify(content))
        let returnData = JSON.parse(response)
        if (returnData) {
          if (returnData.data.apps === null) {
            return null
          }
        }
        if (returnData && returnData.data && returnData.data.apps &&
          returnData.data.apps[0]) {
          // checkArr[key][0] = 'pass'
          checkArr[key].push('pass')
        } else {
          // checkArr[key][0] = 'unpass'
          checkArr[key].push('unpass')
        }
        content = {}
      }
    } else {
      // checkArr[key][0] = 'none'
      checkArr[key].push('none')
    }
  }
  return checkArr
}

let identifyFin = (form, address, rec_name) => {
  return new Promise((resolve, reject) => {
    let {headers, html, url, script, meta, js} = form
    let pollingArr = {headers, html, url, script, meta, js}
    pollingCheck(form, pollingArr, address, rec_name).then((res) => {
      resolve(res)
    })
  })
}

/* todo web识别指纹探测 end */
// 写cookies

var cookie = {
  set: function (key, val) { // 设置cookie方法
    var date = new Date() // 获取当前时间
    var expiresDays = 1 // 将date设置为n天以后的时间
    date.setTime(date.getTime() + expiresDays * 24 * 3600 * 1000) // 格式化为cookie识别的时间
    document.cookie = key + '=' + val + ';expires=' + date.toGMTString() // 设置cookie
  },
  get: function (key) { // 获取cookie方法
    /* 获取cookie参数 */
    var getCookie = document.cookie.replace(/[ ]/g, '') // 获取cookie，并且将获得的cookie格式化，去掉空格字符
    var arrCookie = getCookie.split(';') // 将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
    var tips // 声明变量tips
    for (var i = 0; i < arrCookie.length; i++) { // 使用for循环查找cookie中的tips变量
      var arr = arrCookie[i].split('=') // 将单条cookie用"等号"为标识，将单条cookie保存为arr数组
      if (key === arr[0]) { // 匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
        tips = arr[1] // 将cookie的值赋给变量tips
        break // 终止for循环遍历
      }
    }
    return tips
  },
  delete: function (key) { // 删除cookie方法
    var date = new Date() // 获取当前时间
    date.setTime(date.getTime() - 10000) // 将date设置为过去的时间
    document.cookie = key + '=v; expires =' + date.toGMTString()// 设置cookie
  }
}

// 清除所有cookie
let clearAllCookie = () => {
  var keys = document.cookie.match(/[^ =;]+(?=)/g)
  if (keys) {
    for (var i = keys.length; i--;) {
      document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
  }
}
let checkRegex = (value) => {
  /*
  * * 这里仅仅是为了验证的正则是否正确
  * 正确返回true ,错误返回false
  * 1.正则不能以// 结尾和开始 evial这个方法这是不能检测出来
  * */
  try {
    // if (/.+\/\/$|^\/\/.+/.test(value)) {
    //   // return false
    // }
    if (/.+[^\\]\\$/.test(value)) {
      return false
    }
    /* let reg = evil(`/${value}/`) // 这里进行校验
    let judge = reg.test(value)
    if (judge) {} */
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}
/*
*  python2 check_poc.py --path poc_path --url test_url
*  python2 check_poc.py --path poc_path --ip test_ip --port test_port
*  params:{
*     pyPath:''
*     fileName: '',
*     type: '',
*     url:'',
*     ip:''
*     port:'',
*  }
*  D:\Python27\python.exe
* */
let checkPoc = (params, type) => {
  params.pyPath = localStorage.getItem('pyPath')
  return new Promise((resolve) => {
    let cwd = path.join(remote.app.getPath('userData'), 'poc')
    let checkPath = path.join(remote.app.getPath('userData'),
      'poc/check_poc.py')
    // C:\Users\Boy\AppData\Roaming\Electron\poc\main.py
    let args
    if (params.check_type === 'web') {
      if (params.source === 'cache') {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./cache --url ${params.url}`
      } else {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./${params.fileName} --url ${params.url}`
      }
    } else if (params.check_type === 'server') {
      if (params.source === 'cache') {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./cache --ip ${params.ip} --port ${params.port}`
      } else {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./${params.fileName} --ip ${params.ip} --port ${params.port}`
      }
    } else if (params.check_type === 'check') { // 校验格式是否正确
      if (params.source === 'cache') {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./cache`
      } else {
        args = `${params.pyPath} ${checkPath} --type ${type === 'detect_uri'
          ? 'detect_uri'
          : 'check_format'} --path ./${params.fileName}`
      }
    }
    console.log(args)
    let options = {
      encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200 * 1024,
      killSignal: 'SIGTERM',
      setsid: false,
      cwd: cwd,
      env: null
    }
    let exec = require('child_process').exec
    exec(args, options, function (error, stdout, stderr) {
      console.log(stdout)
      console.log(error)
      if (stdout.length > 1) {
        resolve(stdout)
      }
      if (error) {
        console.log(error.message)
        // if (error.message.indexOf('Command failed') !== -1) {
        //   resolve('请检查Python2.x路径是否正确!')
        //   return false
        // }
        resolve(error.message)
      }
    })
  })
}
let sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

// 字符串转16进制

let strToHex = (str) => {
  if (str === '') { return '' }
  var hexCharCode = []
  hexCharCode.push('0x')
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16))
  }
  return hexCharCode.join('')
}

// 16进制转字符串

let hexToStr = (hexCharCodeStr) => {
  var trimedStr = hexCharCodeStr.trim()
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(
    2) : trimedStr
  var len = rawStr.length
  if (len % 2 !== 0) {
    alert('Illegal Format ASCII Code!')
    return ''
  }
  var curCharCode
  var resultStr = []
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16) // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode))
  }
  return resultStr.join('')
}
var writeUTF = function (str, isGetBytes) {
  var back = []
  var byteSize = 0
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i)
    if (code >= 0x00 && code <= 0x7f) {
      byteSize += 1
      back.push(code)
    } else if (code >= 0x80 && code <= 0x7ff) {
      byteSize += 2
      back.push((192 | (31 & (code >> 6))))
      back.push((128 | (63 & code)))
    } else if ((code >= 0x800 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xffff)) {
      byteSize += 3
      back.push((224 | (15 & (code >> 12))))
      back.push((128 | (63 & (code >> 6))))
      back.push((128 | (63 & code)))
    }
  }
  for (i = 0; i < back.length; i++) {
    back[i] &= 0xff
  }
  if (isGetBytes) {
    return back
  }
  if (byteSize <= 0xff) {
    return [0, byteSize].concat(back)
  } else {
    return [byteSize >> 8, byteSize & 0xff].concat(back)
  }
}

var readUTF = function (arr) {
  if (typeof arr === 'string') {
    return arr
  }
  let UTF = ''
  let _arr = arr
  for (var i = 0; i < _arr.length; i++) {
    let one = _arr[i].toString(2)
    let v = one.match(/^1+?(?=0)/)
    if (v && one.length === 8) {
      var bytesLength = v[0].length
      var store = _arr[i].toString(2).slice(7 - bytesLength)
      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2)
      }
      UTF += String.fromCharCode(parseInt(store, 2))
      i += bytesLength - 1
    } else {
      UTF += String.fromCharCode(_arr[i])
    }
  }
  return UTF
}

var toUTF8Hex = function (str) {
  var charBuf = writeUTF(str, true)
  console.log(charBuf)
  var re = ''
  for (var i = 0; i < charBuf.length; i++) {
    var x = (charBuf[i] & 0xFF).toString(16)
    if (x.length === 1) {
      x = '0' + x
    }
    re += x
  }
  return re
}

var utf8HexToStr = function (str) {
  var buf = []
  for (var i = 0; i < str.length; i += 2) {
    buf.push(parseInt(str.substring(i, i + 2), 16))
  }
  return readUTF(buf)
}
export default {
  install: function (Vue) {
    Vue.prototype.$creatNewWin = (path) => creatNewWin(path)
    Vue.prototype.$open = (link) => open(link)
    Vue.prototype.$formatTime = (time) => formatTime(time) // 格式化时间
    Vue.prototype.$evil = (regex) => evil(regex) // 转化正则
    Vue.prototype.$jsEncrypt = (str) => StrEncrypt(str) // 文本加密
    Vue.prototype.$StrDecrypt = (str) => StrDecrypt(str) // 文本文本解密
    Vue.prototype.$sm2Encrypt = (str) => sm2Encrypt(str) // 编码
    Vue.prototype.$setCookie = (key, val) => cookie.set(key, val) // 设置cookie
    Vue.prototype.$getCookie = (key) => cookie.get(key) // 获取cookie
    Vue.prototype.$clearAllCookie = () => clearAllCookie() // 清除所有cookie
    Vue.prototype.$identifyFin = (form, address, rec_name) => identifyFin(form,
      address, rec_name) // web指纹识别功能
    Vue.prototype.$checkRegex = (str) => checkRegex(str) // 检验正则格式是否正确
    Vue.prototype.$checkPoc = (params) => checkPoc(params) // 进行本地校验poc
    Vue.prototype.$sleep = (params) => sleep(params) // 进行本地校验poc
    Vue.prototype.$strToHexp = (str) => strToHex(str)
    Vue.prototype.$hexToStr = (str) => hexToStr(str)
    Vue.prototype.$FileEncrypt = (str) => FileEncrypt(str)
    Vue.prototype.$FileDecrypt = (str) => FileDecrypt(str)
    Vue.prototype.$SixFileEncrypt = (str) => SixFileEncrypt(str)
    Vue.prototype.$SixFileDecrypt = (str) => SixFileDecrypt(str)
    Vue.prototype.$DataEncrypt = (str) => DataEncrypt(str)
    Vue.prototype.$DataDecrypt = (str) => DataDecrypt(str)
    Vue.prototype.$testEncrypt = (str) => testEncrypt(str)
    Vue.prototype.$testDecrypt = (str) => testDecrypt(str)
    Vue.prototype.$utf8HexToStr = (str) => utf8HexToStr(str)
    Vue.prototype.$toUTF8Hex = (str) => toUTF8Hex(str)
  }
}

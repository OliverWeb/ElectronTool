import axios from 'axios'
import qs from 'qs'
// 在config.js文件中统一存放一些公共常量，方便之后维护
import { baseURL } from './config.js'
// import router from '@/router'
import { Message } from 'element-ui'

// 添加请求拦截器，在发送请求之前做些什么(**具体查看axios文档**)--------------------------------------------
axios.interceptors.request.use(function (config) {
  // 显示loading
  return config
}, function (error) {
  // 请求错误时弹框提示，或做些其他事
  return Promise.reject(error)
})

// 添加响应拦截器(**具体查看axios文档**)----------------------------------------------------------------
axios.interceptors.response.use(res => {
  return res
  // console.log(res.data.)
  // if () {
  //   return router.push({
  //     path: '/login',
  //     query: {redirect: location.pathname + location.search, logs: 'axios'}
  //   })
  // } else {
  //   return res
  // }
}, error => {
  // 对响应错误做点什么
  if (error.message === 'Network Error') {
    return error
  } else {
    // if (error.response && error.response.status === 403) {
    //   // router.push('/index/403')
    // } else if (error.response && error.response.status === 500) {
    //   // router.push('/index/500')
    // } else if (error.response && error.response.status === 404) {
    //   // router.push('/index/404')
    // } else {
    //   Message.error('网络错误，请重试！')
    // }
    Message.error('错误代码：' + error.response.status)
    // 返回 response 里的错误信息
    let errorInfo = error.data.error
      ? error.data.error.message
      : error.data
    return Promise.reject(errorInfo)
  }
})

// 封装数据返回失败提示函数---------------------------------------------------------------------------
// function errorState (response) {
//   // 如果http状态码正常，则直接返回数据
//   if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
//     // 如果不需要除了data之外的数据，可以直接 return response.data
//     return response.data
//   } else {
//     Message.error('网络错误，请重试！')
//   }
// }

// 封装数据返回成功提示函数---------------------------------------------------------------------------
function successState (res) {
  // 隐藏loading
  // 统一判断后端返回的错误码(错误码与后台协商而定,六耳是errcode === '0')
  if (res && res.data && res.data.errcode === '0') {
    return res.data
  }
}

// 封装axios--------------------------------------------------------------------------------------
function apiAxios (method, url, params, opts) {
  let httpDefault = {
    method: method,
    baseURL: baseURL,
    url: url,
    // `params` 是即将与请求一起发送的 URL 参数
    // `data` 是作为请求主体被发送的数据
    params: method === 'GET' || method === 'DELETE' ? params : null,
    // data: method === 'POST' || method === 'PUT' ? qs.stringify(params) : null,
    data: method === 'POST' || method === 'PUT' ? (opts && opts.upload
      ? params
      : qs.stringify(params)) : null,
    timeout: 0, // 不限时长
    // timeout: 10000,
    responseType: opts && opts.responseType ? opts.responseType : 'json',
    /* todo 这里为的了下载的进行修的,后期发现问题这里是可疑点 */
    // responseType: opts.responseType ? opts.responseType : 'json',
    // // 客户端设置失效
    // xsrfCookieName: 'token',
    // xsrfHeaderName: 'SE_XSRFToken'
    // headers: {'SE_XSRFToken': getCookie('token')}
    headers: {'SE_XSRFToken': localStorage.getItem('rep_code')}
  }
  // console.log('axios_local:' + localStorage.getItem('rep_code'))
  // console.log('axios_cookie:' + getCookie('token'))
  // 注意**Promise**使用(Promise首字母大写)
  return new Promise((resolve, reject) => {
    axios(httpDefault)
    // 此处的.then属于axios
      .then((res) => {
        successState(res)
        if (res && res.data) resolve(res.data)
      }).catch((response) => {
      // errorState(response)
        reject(response)
      })
  })
}

// 输出函数get、post、put、delect，供其他文件调用-----------------------------
// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
export default {
  install: function (Vue) {
    Vue.prototype.$http = axios
    Vue.prototype.$get = (url, params) => apiAxios('GET', url, params)
    Vue.prototype.$post = (url, params, opts) => apiAxios('POST', url, params,
      opts)
    Vue.prototype.$put = (url, params) => apiAxios('PUT', url, params)
    Vue.prototype.$delect = (url, params) => apiAxios('DELECT', url, params)
  }
}

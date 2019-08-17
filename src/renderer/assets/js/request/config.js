// 公共路径
let url = ''
if (process.env.NODE_ENV === 'development') {
  url = 'http://127.0.0.1:7700/'
  // url = 'http://10.2.12.8:7701/' // 宋洪圆
} else if (process.env.NODE_ENV === 'debug') {
  url = 'http://127.0.0.1:7700/'
} else if (process.env.NODE_ENV === 'production') {
  // url = 'http://127.0.0.1:7700/'
}

export const baseURL = url

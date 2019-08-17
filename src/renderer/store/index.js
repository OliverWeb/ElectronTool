import Vue from 'vue'
import Vuex from 'vuex'
import { Storage } from '../../renderer/assets/js/common'

// import { createPersistedState, createSharedMutations } from 'vuex-electron'

// import modules from './modules'

Vue.use(Vuex)

// export default new Vuex.Store({
//   modules,
//   // plugins: [
//   //   createPersistedState(),
//   //   createSharedMutations()
//   // ],
//   strict: process.env.NODE_ENV !== 'production'
// })
const state = {
  userInfo: {
    cur_credits: 0,
    mobile: null,
    used_credits: 0,
    user_head_path: '',
    user_id: '',
    user_name: '游客',
    user_status: ''
  },
  isOnline: false,
  htmlCode: '',
  proxy: 'http://127.0.0.1:8080',
  isProxy: false // 是否开启代理
}
try {
  if (localStorage.proxy) {
    state.proxy = localStorage.getItem('proxy')
    state.isProxy = localStorage.getItem('isProxy') === 'true'
  }
} catch (error) {
  console.log(error)
}
const mutations = {
  // 修改用户信息
  updateUserInfo (state, newUserInfo) {
    state.userInfo = newUserInfo
  },
  // 修改登录状态
  toggleState (state, val) {
    state.isOnline = val
  },
  updateHtmlCode (state, val) {
    try {
      Storage.setItem('htmlCode', val)
      console.log('改变了')
      state.htmlCode = val
    } catch (e) {
      console.log(e)
    }
  },
  setProxy (state, val) {
    try {
      localStorage.setItem('proxy', val)
      console.log('改变代理了')
      state.proxy = val
    } catch (e) {
      console.log(e)
    }
  },
  checkProxy (state, val) {
    console.log(1)
    try {
      localStorage.setItem('isProxy', !!val)
      console.log('代理改变')
      state.isProxy = !!val
    } catch (e) {
      console.log(e)
    }
  }
}
export default new Vuex.Store({
  state,
  mutations
})

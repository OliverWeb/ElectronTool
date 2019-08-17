const state = {
  fingerData: {
    name: '',
    host: '',
    port: '',
    protocol: '', // 协议
    package: '' //  探测包
  }
}

const mutations = {
  UPDATE_FINGER (state, params) {
    state.fingerData = {...state.fingerData, ...params}
  }
}
const actions = {
  // do something async
  updateFinger ({commit}, params) {
    commit('UPDATE_FINGER', params)
  }
}

export default {
  state,
  mutations,
  actions
}

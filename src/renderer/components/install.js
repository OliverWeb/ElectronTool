import ACE from './AceEditor.vue'

export default {
  install: function (Vue, options) {
    Vue.component('ace', ACE)
  }
}

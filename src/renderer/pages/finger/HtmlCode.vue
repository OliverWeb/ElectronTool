<template>
	<ace :value="val"></ace>
</template>

<script>
export default {
  data () {
    return {
      val: ''
    }
  },
  created () {
    this.val = localStorage.htmlCode
  },
  mounted () {
    let _this = this
    window.addEventListener('storage', function (e) {
      console.log('触发了的')
      console.log(e.newValue)
      _this.val = e.newValue
    }, false)
  }
}
</script>

<template>
	<div class="HightLighter">
		<div ref="hex" class="dash-border">
			<span v-for="(item,key) in hex" :key="key"><i style="color:#002257;">{{key===0?'': '- '}}</i>{{item}}</span>
		</div>
		<div class="dash-border" style="word-wrap: break-word;">
			<span style="cursor: pointer;" @mouseover="mouseoverFun(key)" @mouseout="mouseoutFun(key)"
						v-for="(item,key) in str" :key="key">{{item}}</span>
		</div>
	</div>
</template>

<script>
export default {
  props: ['result_16', 'result'],
  data () {
    return {
      str: '',
      hex: ''
    }
  },
  watch: {
    result_16 (val) {
      this.hexFun(val)
    },
    result (val) {
      this.strFun(val)
    }
  },
  methods: {
    mouseoverFun (key) {
      this.$refs.hex.querySelectorAll('span')[key].style.color = '#CA0C16'
      let location = this.$refs.hex.querySelectorAll('span')[key].offsetTop
      document.querySelectorAll('.HightLighter>.dash-border')[0].scrollTo(0, location - 60)
    },
    mouseoutFun (key) {
      this.$refs.hex.querySelectorAll('span')[key].style.color = '#002257'
    },
    strFun (val) {
      this.str = val ? val.split('') : []
    },
    hexFun (val) {
      this.hex = val ? val.split('-') : []
    }
  },
  mounted () {
  }
}
</script>

<style lang="less" scoped>
	.HightLighter {
		display: flex;
		flex: 1;
		flex-direction: column;
		
		.dash-border {
			padding: 5px;
			border: 2px dashed #d4dae2;
			border-radius: 5px;
			margin-top: 10px;
			overflow: auto;
			flex: 1;
		}
	}
</style>

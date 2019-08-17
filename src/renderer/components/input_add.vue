<template>
	<el-form :ref="config.label" label-width="100px" :size="size" @submit.native.prevent>
		<el-form-item
			:label="index===0?config.label +'：':''"
			v-for="(domain, index) in headers"
			:key="domain.key"
			:error="error[index]"
			:prop="'headers' + index">
			<el-input
				:disabled="config.disabled"
				:placeholder='config.placeholder'
				@input="inpuFun(domain.value,index)"
				@blur="blurFun(domain.value,index)"
				:size="size"
				v-model.trim="domain.value">
				<el-button
					:disabled="config.disabled"
					v-if="index!==0"
					tyep="primary"
					@click.prevent="removeVideoLink(domain)"
					slot="append"
					circle
					icon="el-icon-remove-outline">
				</el-button>
				<el-button
					:disabled="config.disabled"
					v-else
					tyep="primary"
					@click.prevent="addVideoLink()"
					slot="append"
					circle
					icon="el-icon-circle-plus-outline">
				</el-button>
			</el-input>
		</el-form-item>
	</el-form>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: function () {
        return []
      }
    },
    config: {
      type: Object,
      default: function () {
        return {
          label: '请输入',
          disabled: false,
          placeholder: '',
          type: ''
        }
      },
      require: true
    },
    size: {
      default: ''
    }
  },
  data () {
    return {
      headers: [{value: ''}],
      error: []
    }
  },
  watch: {
    value (val) {
      this.headers = val
    },
    headers: {
      handler (val, oldVal) {
        this.$emit('emitVal', val)
      },
      deep: true
    },
    '$route' () {
      if (JSON.stringify(this.$route.query) === '{}') {
        this.config.disabled = false
      }
    }
  },
  computed: {},
  mounted () {
    if (JSON.stringify(this.$route.query) === '{}') {
      this.config.disabled = false
    }
  },
  methods: {
    blurFun (value, index) {
    },
    setError (index) {
      this.$emit('errReg', true)
      this.$set(this.error, index, '请检查输入正则是否正确!!')
    },
    clearError (index) {
      this.$emit('errReg', false)
      this.$set(this.error, index, '')
    },
    inpuFun (value, index) {
      if (value) {
        try {
          if (this.config.type === 'obj') { // 检验对象格式html,meta,js
            if (/(.+):(.*)/.test(value)) { // 是否的 xxx:xxx 格式的内容
              value = value.replace(/(\s*):(\s*)/g, ':') // 将:两边的空格进行清空
              let i = value.indexOf(':')
              let end = value.substring(i + 1)
              if (!this.$checkRegex(end)) { // 检测: 后面的正则是否正确
                this.setError(index)
              } else {
                this.clearError(index)
              }
            } else {
              this.setError(index)
            }
          } else { // 检验数组 html, script
            if (!this.$checkRegex(value)) { // 验证输入正则是否正确
              this.setError(index)
            } else {
              this.clearError(index)
            }
          }
        } catch (e) { //  报错信息
          console.log(e)
          this.setError(index)
        }
      } else {
        this.clearError(index)
      }
    },
    removeVideoLink (item) {
      if (this.headers.length === 1) {
        this.$message.success('客官请手下留情...')
      } else {
        let index = this.headers.indexOf(item)
        if (index !== -1) {
          this.headers.splice(index, 1)
        }
      }
    },
    addVideoLink () {
      this.headers.push({
        value: '',
        key: Date.now()
      })
    }
  },
  components: {}
}
</script>

<style lang="less" scoped>
	.el-input-group__append .el-button {
		margin: -10px -16px;
	}
</style>


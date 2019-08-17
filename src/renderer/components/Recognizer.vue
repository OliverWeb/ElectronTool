<template>
	<div id="home">
		<el-form ref="form" :rules="rules" :model="form" label-width="95px">
			<el-form-item label="回包：" prop="introduction">
				<el-input
					type="textarea"
					:autosize="{ minRows: 6, maxRows: 16}"
					placeholder="请输入"
					v-model="form.result_16">
				</el-input>
			</el-form-item>
			<el-form-item label="服务：" prop="service">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form.service">
				</el-input>
			</el-form-item>
			<el-form-item label="规则：" prop="pattern">
				<el-input
					style="width: 300px"
					type="text"
					placeholder="请输入"
					v-model="form.pattern">
				</el-input>
				<el-checkbox v-model="overall">全局搜索</el-checkbox>
				<el-checkbox style="margin-left: 0" v-model="bigsmall">忽略大小写</el-checkbox>
				<el-button :disabled="!this.form.result_16 || !this.form.pattern" size="medium" type="primary"
									 @click="handleSearch()">校验
				</el-button>
			</el-form-item>
			<el-form-item label="应用：" prop="application">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form.application">
				</el-input>
			</el-form-item>
			<el-form-item label="版本：" prop="service_version">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form.service_version">
				</el-input>
			</el-form-item>
			<el-form-item label="信息：" prop="info">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form.info">
				</el-input>
			</el-form-item>
			<el-form-item label="CPE：" prop="CPE">
				<el-input
					type="textarea"
					:autosize="{ minRows: 6, maxRows: 16}"
					placeholder="请输入"
					v-model="form.CPE">
				</el-input>
			</el-form-item>
		</el-form>
		<h3>识别信息</h3>
		<el-form label-width="95px" :model="form2">
			<el-form-item label="服务：" prop="introduction">
				<el-input
					type="input"
					v-model="form2.service">
				</el-input>
			</el-form-item>
			<el-form-item label="应用：" prop="application">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form2.application">
				</el-input>
			</el-form-item>
			<el-form-item label="版本：" prop="service_version">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form2.service_version">
				</el-input>
			</el-form-item>
			<el-form-item label="信息：" prop="info">
				<el-input
					type="input"
					placeholder="请输入"
					v-model="form2.info">
				</el-input>
			</el-form-item>
			<el-form-item label="CPE：" prop="CPE">
				<el-input
					type="textarea"
					placeholder="请输入"
					v-model="form2.CPE">
				</el-input>
			</el-form-item>
		</el-form>
	</div>
</template>


<script>

export default {

  data () {
    return {
      form: {
        result_16: '',
        service: '',
        pattern: '',
        application: '',
        service_version: '',
        info: '',
        CPE: ''
      },
      form2: {},
      overall: true,
      bigsmall: true,
      rules: {
        name: [{required: true, message: '请输入检测内容', trigger: 'blur'}],
        level: [{required: true, message: '请输入正则表达式', trigger: 'blur'}]
      }
    }
  },
  watch: {
    '$store.state.finger.fingerData' (val) {
      this.form.result_16 = val.result_16
    }
  },
  mounted () {
  },
  methods: {
    handleSearch () {
      let pattern = `/${this.form.pattern}/`
      this.$refs.form.validate((valid) => {
        if (valid) {
          let str = this.$store.state.finger.fingerData.result
          let re
          if (this.overall) {
            pattern = `${pattern}g`
          }
          if (this.bigsmall) {
            pattern = `${pattern}i`
          }
          try {
            re = this.$evil(pattern)
          } catch (e) {
            this.$message.error('正则表达式不正确,请检查后重新输入!')
          }
          if (re.test(str)) {
            this.form2 = {...this.form}
            console.log(this.form2)
            this.$store.dispatch('updateFinger', this.form2)
          } else {
            this.$message.error('你好坏')
          }
          // if (str.match(re)) {
          //   let result = str.match(re).join('\n')
          //   this.form.result = `匹配结果:\n${result}`
          // } else {
          //   this.form.result = '无匹配内容'
          // }
        }
      })
    }
  }
}
</script>
<style>
	#home {
		padding: 60px;
	}
</style>

<template>
	<div>
		<el-form ref="form" :rules="rules" :model="form" label-width="95px" style="width:600px">
			<el-form-item label="请求：">
				<el-select v-model="form.protocol" placeholder="请选择">
					<el-option label="TCP" value="TCP"></el-option>
					<el-option label="UDP" value="UDP"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="主机：" prop="host">
				<el-input
					placeholder="请输入"
					v-model="form.host">
				</el-input>
			</el-form-item>
			<el-form-item label="端口：" prop="port">
				<el-input
					placeholder="请输入"
					v-model="form.port">
				</el-input>
			</el-form-item>
			<el-form-item label="名称：" prop="name">
				<el-input
					placeholder="请输入"
					v-model="form.name">
				</el-input>
			</el-form-item>
			<el-form-item label="探测包：" prop="package">
				<el-input
					placeholder="请输入"
					v-model="form.package">
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleSearch">检测</el-button>
			</el-form-item>
			<el-form-item label="回包：">
				<el-input
					type="textarea"
					:autosize="{ minRows: 6, maxRows: 16}"
					v-model="form.result_16">
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-input
					type="textarea"
					:autosize="{ minRows: 6, maxRows: 16}"
					v-model="form.result">
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
        name: '',
        host: '127.0.0.1',
        port: '8080',
        protocol: 'TCP',
        package: 'helo mapx',
        result: '',
        result_16: ''
      },
      rules: {
        host: [{required: true, message: '请输入', trigger: 'blur'}],
        port: [
          {required: true, message: '请输入', trigger: 'blur'}
        ]
      }
    }
  },
  mounted () {
    // this.$tcp({host: '127.0.0.1', port: 8000})
  },
  methods: {
    stringToHex (str) {
      var val = ''
      for (var i = 0; i < str.length; i++) {
        if (val === '') {
          val = str.charCodeAt(i).toString(16) // 获取字符的Unicode码然后转16进制
        } else {
          val += str.charCodeAt(i).toString(16)// 获取字符的Unicode码然后转16进制再拼接,中间用逗号隔开
        }
      }
      return val
    },
    handleSearch () {
      this.$refs.form.validate(valid => {
        let params = {
          host: this.form.host,
          port: this.form.port,
          package: this.form.package
        }
        if (valid) {
          if (this.form.protocol === 'TCP') {
            this.$tcp(params)
              .then(res => {
                this.form.result = res.toString()
                this.form.result_16 = this.stringToHex(this.form.result)
                this.$store.dispatch('updateFinger', this.form)
              })
              .catch(err => {
                this.form.result = err.toString()
              })
          } else {
            this.$udp(params)
              .then(res => {
                this.form.result = res.toString()
              })
              .catch(err => {
                this.form.result = err.toString()
              })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
</style>

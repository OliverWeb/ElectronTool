<template>
	<div id="home">
		<el-form ref="form" :model="form" label-width="95px">
			<el-form-item label="NMAP：" prop="NMAP">
				<el-input
					type="textarea"
					:autosize="{ minRows: 6, maxRows: 16}"
					placeholder="请输入"
					v-model="form.NMAP">
				</el-input>
			</el-form-item>
		</el-form>
		<el-form style="text-align: right">
			<el-button size="mini" type="primary" :disabled="disabled" @click="generate()">生成
			</el-button>
		</el-form>
	</div>
</template>


<script>

export default {

  data () {
    return {
      form: {
        NMAP: ''
      },
      disabled: true
    }
  },
  watch: {
    '$store.state.finger.fingerData' (val) {
      console.log('存在服务' + val.service)
      if (val.service) {
        this.disabled = false
      }
    }
  },
  mounted () {
  },
  methods: {
    generate () {
      this.form.NMAP = this.$store.state.finger.fingerData.result_16
    }
  }
}
</script>
<style>
	#home {
		padding: 60px;
	}
</style>

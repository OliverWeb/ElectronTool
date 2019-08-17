<template>
	<div class="setting">
		<div class="setting-content">
			<el-button style="margin-bottom: 10px" size="mini" type="success" @click="back()">返回</el-button>
			<el-form class="co_form_width" :model="form" ref="form" label-width="100px" size="small">
				<h3 style="margin-bottom:10px" class="swiper-title">设置</h3>
				<el-form-item label="代理地址:" prop="name">
					<el-input style="width: 300px" placeholder="http://127.0.0.1:8080" size="medium"
										v-model.trim="form.name"></el-input>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        name: this.$store.state.proxy
      }
    }
  },
  watch: {
    'form.name' (val) {
      this.$store.commit('setProxy', val)
    }
  },
  methods: {
    back () {
      this.$router.back(-1)
    }
  }
}
</script>

<style lang="less">
	.setting {
		flex: 1;
		padding: 35px;
		display: flex;
		background-color: #F7F8F9;
		
		.setting-content {
			padding: 25px;
			background-color: #fff;
			border: 1px solid #E6EAEE;
			border-radius: 10px;
			flex: 1;
		}
	}

</style>

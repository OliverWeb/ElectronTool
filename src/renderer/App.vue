<template>
	<div id="app">
		<router-view></router-view>
		<el-dialog
			title="设置"
			:visible.sync="dialogVisible"
			width="40%">
			<div>
				<el-form class="co_form_width" :model="form" ref="form" label-width="100px" size="small">
					<el-form-item label="代理地址：" prop="name">
						<el-input style="width: 200px" clearable placeholder="请输入代理接口" size="medium"
											v-model.trim="form.name"></el-input>
					</el-form-item>
					<el-form-item label="是否开启：" prop="name">
						<el-switch v-model="edit" active-color="#52c41a" inactive-color="#bfbfbf"></el-switch>
					</el-form-item>
				</el-form>
			</div>
			<span slot="footer" class="dialog-footer">
    <el-button type="primary" size="medium" @click="dialogVisible = false">关闭</el-button>
  </span>
		</el-dialog>
	</div>
</template>
<script>
import path from 'path'
import { remote, ipcRenderer } from 'electron'
import { copyFolder } from '@/assets/js/common.js'

export default {
  name: 'my-project',
  data () {
    return {
      dialogVisible: false,
      edit: !!this.$store.state.isProxy,
      form: {
        name: this.$store.state.proxy
      }
    }
  },
  watch: {
    'form.name' (val) {
      this.$store.commit('setProxy', val)
      this.$store.commit('checkProxy', !!this.edit)
    },
    edit (val) {
      this.$store.commit('setProxy', this.form.name)
      this.$store.commit('checkProxy', !!val)
    }
  },
  mounted () {
    ipcRenderer.on('setting', (event, message) => {
      if (message === 'setting') {
        this.dialogVisible = true
      }
    })
    // 监听右键菜单
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      // 给主进程广播事件   注意this指向
      this.$electron.ipcRenderer.send('contextmenu')
    })
    this.saveLocalFile()
  },
  methods: {
    async saveLocalFile () {
      // deleteFolder(path.join(remote.app.getPath('userData'), './poc'))
      // await this.$sleep(1000)
      copyFolder(path.join(__static, './poc'), path.join(remote.app.getPath('userData'), './poc'))
    }
  }
}
</script>

<style>
	/* CSS */
</style>

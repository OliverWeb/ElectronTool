<template>
	<div class="page">
		<div>
			<p class="title">mqtt</p>
			<el-form class="co_form_width" :model="form" ref="form" label-width="100px" size="small">
				<el-form-item label="Topic：" prop="topic">
					<el-input placeholder="请输入发包数据" size="medium"
										v-model.trim="form.topic"></el-input>
				</el-form-item>
				<el-form-item label="target：" prop="target">
					<el-input placeholder="请输入ip:host" size="medium"
										v-model.trim="form.target"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handlePost()">运行</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
import mqtt from 'mqtt'

export default {
  data () {
    return {
      form: {
        topic: '/vt/demo',
        target: '47.104.66.96:1883'
      }
    }
  },
  mounted () {},
  methods: {
    // mqtt.server-uri=tcp://47.104.66.96:1883
    // mqtt.username=vtstar
    // mqtt.password=Vtstar888
    handlePost () {
      let _this = this
      let url = 'mqtt://47.104.66.96:1883'
      let option = {
        username: 'vtstar',
        password: 'Vtstar888'
      }
      let client = mqtt.connect(url, option)
      client.on('connect', function () {
        console.log('%c ' + '连接成功', 'color: red')
        client.subscribe(_this.form.topic, function (err) {
          if (!err) {
            console.log(err)
          }
          console.log('%c ' + '订阅了', 'color: red')
        })
      })

      client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
        client.end()
      })
    }
  },
  components: {}
}
</script>

<style scoped>
</style>

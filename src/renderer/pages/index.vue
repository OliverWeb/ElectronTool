<template>
    <div class="body">
        <el-tabs v-model="activeName" @tab-click="handleClick">
					<el-tab-pane label="探测器" name="1">
						<tcp-test></tcp-test>
					</el-tab-pane>
					<el-tab-pane label="识别器 " name="2">
						<recognizer></recognizer>
					</el-tab-pane>
					<el-tab-pane label="指纹 " name="3">
						<finger></finger>
					</el-tab-pane>
					<el-tab-pane label="新窗口" name="4">
						<el-button type="primary" @click="$creatNewWin('newPage')">新窗口</el-button>
						<el-button type="primary" @click="$open('https://www.baidu.com/')">打开默认浏览器</el-button>
					</el-tab-pane>
					<el-tab-pane label="指纹列表" name="5">
						<finger-list></finger-list>
					</el-tab-pane>
				</el-tabs>
    </div>
</template>

<script>
import TcpTest from '../components/TcpTest'
import Recognizer from '../components/Recognizer'
import finger from '../components/finger'
// import FingerList from '../components/fingerlist'
// const {ipcRenderer} = require('electron')
export default {
  data () {
    return {
      activeName: '5'
    }
  },
  mounted () {
    // this.$save({name: 'tom', id: 1})
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
    // this.$post('un_passport?act=get_published_count_handler')
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
  },
  methods: {
    // newWin () {
    //   this.$creatNewWin('newPage')
    // }
    handleClick (tab, event) {
      // .console.log(tab, event)
    }
  },
  components: {
    TcpTest,
    Recognizer,
    finger
    // FingerList
  }
}
</script>

<style scoped>
.body{
  padding: 20px
}
</style>

<template>
    <div class="page">
        <div>
            <p class="title">漏洞插件</p>
            <p class="content">您需要在连接互联网状态下创建漏洞插件（仅兼容MAPX语法），并保存在客户端本地；当客户端连接互联网后，可手动同步到您在六耳线上平台的账号里。若您在一台新的计算机上运行六耳客户端，或者是重新安装六耳客户端，也可将您在六耳线上平台中的插件同步下来。您还可以浏览插件库了解更多。</p>
            <el-row :gutter="26">
                <el-col :span="6" v-for="(val,index) in config" :key="index">
                    <div class="grid-content" :class="{active:active===index}" @click="select(index,val.path)">
                        <i class="iconfont" :class="val.icon"></i>
                        {{val.name}}
                    </div>
                </el-col>
            </el-row>
            <el-button type="primary" class="mt20" @click="$router.push(goUrl)"  v-if="active===0||active===3" :disabled='(!$store.state.isOnline)&&(active===3)'>
                下一步
            </el-button>
            <el-button type="primary" class="mt20" @click="$router.push(goUrl)" :disabled='(!$store.state.isOnline)&&(active!==1)'  v-else>
                开 始
            </el-button>
        </div>
        <p class="ps_word">* 部分功能需要客户端连接互联网</p>
        <login :visible='showLogin' @isLogin="rebackInfo" ref="login"></login>
    </div>
</template>

<script>
import Login from '../../renderer/components/Login'
export default {
  data () {
    return {
      config: [
        {name: '创建新插件', icon: 'icon-chuangjian', path: 'SelectPluginType'},
        {name: '管理本地插件', icon: 'icon-wenjianjia', path: 'PluginList'},
        {name: '浏览插件库', icon: 'icon-library', path: 'ViewPluginOnline'},
        {name: '同步插件', icon: 'icon-tongbu', path: 'UpdatePlugin'}
      ],
      active: 0,
      goUrl: 'SelectPluginType',
      showLogin: false
    }
  },
  methods: {
    select (i, url) {
      this.active = i
      this.goUrl = url
      if ((this.active === 2 || this.active === 3) && !this.$store.state.isOnline) {
        this.$confirm('此功能需要先登录！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.showLogin = true
        }).catch(() => {
          this.showLogin = false
        })
      }
    },
    rebackInfo (val) {
      this.showLogin = val
    }
  },
  components: {
    Login
  }
}
</script>

<style scoped>
</style>

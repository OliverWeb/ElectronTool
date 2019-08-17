<template>
    <div class="my_header">
        <div class="logo"></div>
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal"  router >
            <el-menu-item index="/index/finger">
                <i class="iconfont icon-zhiwen mr10"></i>
                mqtt
            </el-menu-item>
        </el-menu>
        <div class="userInfo">
                <div class="text">
                    <p class="name">{{user_name}}</p>
                    <el-dropdown  @command="handleCommand" trigger="click">
                            <div>
                                <i class="iconfont icon-circle circle" :class="{green:isOnline,grey:!isOnline}"></i>
                                <span class="online">{{isOnline?'在线':'离线'}}</span>
                            </div>
                        <el-dropdown-menu slot="dropdown">
                             <el-dropdown-item  command="1">
                                 <i class="iconfont icon-circle header_circle green"></i>
                                 <span>在线</span>
                             </el-dropdown-item>
                             <el-dropdown-item command="0">
                                <i class="iconfont icon-circle header_circle grey"></i>
                                <span>离线</span>
                             </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <img :src="userImgUrl"  onerror="this.src='static/unlogin.png'" class="userImg">
                <!-- <img :src="'static/unlogin.png'" class="userImg"> -->
                <el-dropdown @command="handleMore">
                  <i class="iconfont icon-diandian icon"></i>
                  <!-- <span class="el-dropdown-link">
                    下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
                  </span> -->
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="clearLogin">清除登录</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
            </div>
            <login :visible='showLogin' @isLogin="rebackInfo" ref="login"></login>
    </div>
</template>

<script>
import Login from './Login'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      activeIndex: '/index/finger',
      showLogin: false
    }
  },
  computed: {
    ...mapState(['userInfo', 'isOnline']),
    user_name () {
      let name = localStorage.getItem('user_name') ? localStorage.getItem('user_name') : this.userInfo.user_name
      return name
    },
    userImgUrl () {
      let baseUrl
      if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://127.0.0.1:7700/'
      } else {
        baseUrl = 'http://xiaoxiaohan.com/'
      }
      return baseUrl + 'static/upload_img/user_head/' + this.userInfo.user_head_path
    }
  },
  watch: {
    isOnline (val) {
      if (val) {
        this.showLogin = true
      } else {
        this.showLogin = false
      }
    }
  },
  mounted () {
    // if (localStorage.getItem('showLogin') !== 'true') {
    //   this.showLogin = true
    // }
    // console.log(this.$route)
  },
  methods: {
    ...mapMutations(['updateUserInfo', 'toggleState']),
    handleCommand (command) {
      if (command === '1') {
        this.showLogin = true
      } else {
        this.showLogin = false
      }
    },
    handleMore (command) {
      if (command === 'clearLogin') {
        this.$refs.login.applyLogout()
        localStorage.removeItem('userInfo')
        localStorage.removeItem('user_name')
        localStorage.removeItem('showLogin')
        localStorage.removeItem('rep_code')
        let userInfo = {
          cur_credits: 0,
          mobile: null,
          used_credits: 0,
          user_head_path: '',
          user_id: '',
          user_name: '游客',
          user_status: ''
        }
        this.updateUserInfo(userInfo)
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

<style lang='less'>
</style>

<template>
  <el-dialog
    title="请登录"
    :visible.sync="isVisible"
    width="480px"
    :before-close="handleClose"
    close-on-click-modal
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="80px"
      style="padding-right:20px"
    >
      <el-form-item label="手机号:" prop="mobile">
        <el-input v-model="form.mobile" clearable @keyup.enter.native="handleLogin"></el-input>
      </el-form-item>
      <el-form-item label="密 码:" prop="password">
        <el-input v-model="form.password" :type="password" @keyup.enter.native="handleLogin">
           <i slot="suffix" class="el-input__icon el-icon-view pointer" @click="showPwd=!showPwd" :class="{green:showPwd}"></i>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" class="mt10" style="width:100%">登 录</el-button>
         <p><el-checkbox v-model="checked" class="mr20 ">不再提示</el-checkbox>
        <span class="pointer" @click="forgetPwd">忘记密码？</span></p>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  props: {
    visible: {
      default: false
    }
  },
  data () {
    return {
      isVisible: false,
      showPwd: false,
      checked: false,
      form: {
        mobile: '',
        password: ''
      },
      rules: {
        mobile: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState(['userInfo', 'isOnline']),
    password () {
      return this.showPwd ? 'text' : 'password'
    }
  },
  watch: {
    visible (val) {
      if (val) {
        if (localStorage.getItem('userInfo')) {
          let info = JSON.parse(localStorage.getItem('userInfo'))
          this.applyLogin(info)
        } else {
          this.isVisible = true
        }
      } else if (this.isOnline) {
        this.applyLogout()
      }
    },
    checked (val) {
      // console.log(val)
      if (val) {
        localStorage.setItem('showLogin', val)
      }
    }
  },
  mounted () {
    // 开发时用，生产时注销
    // localStorage.clear()

  },
  methods: {
    ...mapMutations(['updateUserInfo', 'toggleState']),
    handleLogin () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          localStorage.setItem('userInfo', JSON.stringify(this.form))
          this.applyLogin(this.form)
        } else {
          return false
        }
      })
    },
    applyLogin (data) {
      // this.$clearAllCookie()
      let parames = {
        mobile: this.$jsEncrypt(data.mobile),
        password: this.$jsEncrypt(data.password)
      }
      this.$post('/login_sixear?act=client_login_handler', parames)
        .then(res => {
          if (res.errcode === '0' && res.data.rep_code) {
            this.updateUserInfo(res.data)
            this.toggleState(true)
            this.isVisible = false
            localStorage.setItem('user_name', res.data.user_name)
            localStorage.setItem('rep_code', res.data.rep_code)
            this.$setCookie('token', res.data.rep_code)
            // 获取用户头像
            // this.applyUserImg()
          } else {
            this.$emit('isLogin', false)
            this.$message.error(res.errmsg)
          }
        })
        .catch(err => {
          this.$emit('isLogin', false)
          console.log(err)
        })
    },
    // applyUserImg () {
    //   this.$post('client?act=get_head_handler')
    //     .then(res => {
    //       console.log(res)
    //     })
    //     .catch(() => {})
    // },
    applyLogout () {
      this.$post('logout?act=logout_handler')
        .then(res => {
          if (res.errcode === '0') {
            this.toggleState(false)
            this.isVisible = false
            this.$emit('isLogin', false)
          } else {
            this.$message.error(res.errmsg)
          }
        })
        .catch(() => {
          console.log('登出失败！')
          this.$emit('isLogin', true)
        })
    },
    handleClose (done) {
      this.$emit('isLogin', false)
      this.isVisible = false
    },
    forgetPwd () {
      this.$open('http://xiaoxiaohan/find_pass')
    }
  }
}
</script>

<style scoped>
</style>

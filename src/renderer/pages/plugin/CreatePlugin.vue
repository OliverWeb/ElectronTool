<template>
	<div class="finger_web">
		<breadcrumb @backStep="backStep" @BreadCrumb="BreadCrumb" class="breadTitle"></breadcrumb>
		<div class="container">
			<div class="swiper-container">
				<div class="swiper-wrapper">
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form" :rules="rules" ref="form" label-width="120px"
										 size="small">
							<h3 class="swiper-title">基本信息</h3>
							<el-form-item v-if="$store.state.isOnline" label="漏洞名称：" prop="name">
								<el-select
									@change="watchName"
									ref="name_select"
									style="width: 100%;"
									:loading="name_loading"
									clearable
									:popper-append-to-body="true"
									:remote-method="remoteMethod"
									filterable
									remote
									class="input_width"
									size="medium"
									v-model="form.name"
									placeholder="请选择漏洞名称">
									<el-option
										v-for="(item,index) in vulName"
										:key="index"
										:label="`${item.name}${item.CVE?'('+ item.CVE+')': ''}`"
										:value="JSON.stringify(item)">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item v-else label="漏洞名称：" size="medium" prop="name">
								<el-input :disabled="!$store.state.isOnline && !!form.vul_id && !!$route.query._id"
													@input="changeName()" v-model="form.name"
													placeholder="请输入漏洞名称"></el-input>
							</el-form-item>
							<el-form-item label="类型：" prop="vul_type">
								<el-select style="width: 100%;" :disabled="disabled" filterable class="input_width" size="medium"
													 v-model="form.vul_type"
													 placeholder="请选择漏洞插件类型">
									<el-option
										style="width:200px"
										v-for="item in vulType"
										:key="item.type"
										:label="item.chinese"
										:value="item.type">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="兼容性：" prop="compatibility">
								<el-input :disabled="true" v-model="form.compatibility" size="medium"></el-input>
							</el-form-item>
							<el-form-item label="受影响实体：" prop="query">
								<el-input
									type="textarea"
									rows="2"
									placeholder='请输入受影响实体，例如：app="weblogic"'
									v-model.trim="form.query">
								</el-input>
							</el-form-item>
							<el-form-item label="能否利用：" prop="use_flag">
								<el-radio-group :disabled="disabled" v-model="form.use_flag">
									<el-radio label="check">检查</el-radio>
									<el-radio label="check_use">检查+利用</el-radio>
								</el-radio-group>
							</el-form-item>
							<el-form-item label="依赖库：" prop="python_lib_list">
								<el-input
									type="textarea"
									rows="2"
									placeholder="请输入python第三方依赖库，如requests,future,flask"
									v-model="form.python_lib_list">
								</el-input>
							</el-form-item>
							<el-form-item label="备注：" prop="remark">
								<el-input
									type="textarea"
									rows="4"
									placeholder="请添加备注"
									v-model="form.remark">
								</el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" plain @click="generateFile()">
								生成上传模板
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form" size="small">
							<h3 class="swiper-title">目录结构</h3>
							<el-form-item prop="address" label="">
								<div>
									<el-tree :data="form.DirTree" :props="defaultProps"></el-tree>
								</div>
							</el-form-item>
						</el-form>
						<upload :PropsFilList="PropsFilList" ref="upload"
										@SendFile="ReceiveFile">
						</upload>
						<div style="height:38px;margin-top:10px;" v-if="show_downFile">
							<el-button class="handle_btn" type="info" plain @click="downPluginFile()">
								下载已上传文件
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form">
							<h3 class="swiper-title">规范性检测</h3>
							<el-form-item prop="check_info" label="">
								<el-input
									placeholder="检测漏洞插件语法规范性，以及能否被正确执行"
									:readonly="true"
									ref="returnPackage"
									class="dash_textarea"
									:disabled="disabled"
									type="textarea"
									:rows="13"
									v-model="form.check_info">
								</el-input>
							</el-form-item>
							<el-form-item label="本地python路径：" prop="pyPath">
								<el-input size="medium" v-model="pyPath" placeholder="请输入填写本地python2.x路径"></el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px" class="btn-box">
							<el-button class="handle_btn" type="info" :loading="checkFileLoading" plain @click="checkFile">检测
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form" :rules="rules" ref="form_check" label-width="80px"
										 size="medium">
							<p style="margin-bottom:20px" class="title">本地检测</p>
							<el-form-item label="类型：" prop="type">
								<el-select v-model="form.check_type" style="width: 100%">
									<el-option label="Web漏洞" value="web"></el-option>
									<el-option label="主机或服务漏洞" value="server"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item v-if="form.check_type ==='web'" label="URL：" prop="url">
								<el-input v-model="form.url" placeholder="请输入 http://URL"></el-input>
							</el-form-item>
							<div v-if="form.check_type!=='web'">
								<el-form-item label="目标：" prop="ip">
									<el-input v-model="form.ip" placeholder="请输入IP地址"></el-input>
								</el-form-item>
								<el-form-item label="端口：" prop="port">
									<el-input v-model="form.port" placeholder="请输入端口号"></el-input>
								</el-form-item>
							</div>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" @click="handleCheck" :loading="check_loading" plain>
								{{check_loading?'正在验证':'验证'}}
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" size="small">
							<h3 class="swiper-title">验证结果</h3>
							<el-form-item prop="introduction" label="">
								<el-input
									:readonly="true"
									ref="returnPackage"
									class="dash_textarea"
									:disabled="disabled"
									type="textarea"
									:rows="18"
									v-model="form.check_res">
								</el-input>
							</el-form-item>
						</el-form>
					</div>
				</div>
				<!-- Add Pagination -->
				<div class="swiper-pagination"></div>
			</div>
		</div>
		<!-- 上下页 -->
		<i class="el-icon-arrow-left arrow left_arrow" @click="goNext('prev')"
			 :class="{unactived:activeIndex===0}"></i>
		<i class="el-icon-arrow-right arrow right_arrow" @click="goNext('next')" :class="{unactived:activeIndex===4}"></i>
	</div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import Upload from '@/components/Upload'
import { remote } from 'electron'
import Swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'
import md5 from 'blueimp-md5'
import { copyFolder, deleteFolder, geFileList } from '@/assets/js/common.js'

let fs = require('fs')
let path = require('path')
let compressing = require('compressing')
let Buffer = require('safe-buffer').Buffer
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
export default {
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      show_downFile: false,
      plugin_type: require('../../../../static/json/plugin_type'),
      Regerr: false,
      toStep: '', // 控制路由返回上一步
      fromStep: '',
      vulType: [],
      vulName: [],
      oldName: [],
      PropsFilList: '',
      $Blob: '',
      old_form: '',
      old_name: '',
      upload_plugin: false, // 是否上传插件
      name_loading: false, // 获取漏洞名称loading
      checkFileLoading: false, // 检验文件loading
      check_loading: false, // 检验文件loading
      form: {
        DirTree: [],
        name: '', // 漏洞名称
        vul_type: '',
        compatibility: 'MAPX',
        query: '',
        python_lib_list: '',
        remark: '',
        plugin_name: '', // 插件名字
        use_flag: 'check',
        check_info: '',
        check_res: '',
        check_type: 'web', // 检测类型,确定是web检测还是服务检测
        saved_plugin: false,
        submit_type: 'offline', // 提交类型,确定的离线还是在线
        url: '',
        ip: '',
        port: ''
      },
      initform: {
        DirTree: [],
        name: '', // 漏洞名称
        vul_type: '',
        compatibility: 'MAPX',
        query: '',
        python_lib_list: '',
        remark: '',
        plugin_name: '', // 插件名字
        use_flag: 'check',
        check_info: '',
        check_res: '',
        check_type: 'web', // 检测类型,确定是web检测还是服务检测
        saved_plugin: false,
        submit_type: 'offline', // 提交类型,确定的离线还是在线
        url: '',
        ip: '',
        port: ''
      },
      rules: {
        name: [
          {required: true, trigger: 'blur', message: '请输入漏洞名称'}, {
            validator: async (rule, value, callback) => {
              if (!value) {
                callback()
                // } else if (/^[A-Za-z0-9_\u4E00-\u9FA5\s.-]+$/.test(value)) {
              } else if (value) {
              } else {
                callback(new Error('请填写指纹!'))
              }
            }
          }],
        vul_type: [{required: true, message: '请选择插件类型', trigger: 'change'}],
        query: [
          {required: true, message: '请填写受影响实体', trigger: 'blur'}, {
            validator: (rule, value, callback) => {
              if (value) {
                if ((/(app="\w+"(\sor\s)?)+/).test(value)) {
                  callback()
                } else {
                  callback(new Error('请按照格式填写：app="xxx" or app="xxxx"'))
                }
                callback()
              } else {
                callback(new Error('请填写受影响实体!'))
              }
            }
          }],
        use_flag: [{required: true, message: '请选择', trigger: 'change'}],
        url: [{required: true, message: '请输入地址', trigger: 'blur'}],
        ip: [{required: true, message: '请输入目标IP', trigger: 'blur'}],
        port: [{required: true, message: '请输入端口', trigger: 'blur'}],
        pyPath: [{required: true, message: '请填写Python2.x路径', trigger: 'blur'}]
      },
      disabled: false,
      mySwiper: '',
      activeIndex: 0,
      Man_loading: false,
      VendorOption: [],
      /* 添加多个 */
      dialogVisible: false,
      dialogTableVisible: false,
      isSave: false, // 是否点击过保存按钮,
      handleBack: false, // 是否点击返回按钮
      fingerList: [],
      identify_loading: false, // 识别的loading
      upload_loading: false, // 上传文件loading,
      showResult: false, // 显示识别结果
      pyPath: localStorage.getItem('pyPath')
    }
  },
  // todo vue-router 子组件使用beforeRouteLeave不起作用
  beforeRouteLeave (to, from, next) {
    /*
    * 1.初次新建数据的时候的进行,新填写的数据,
    * 2.若是获取详情的数据的进行判断和当前的新数据是否发相同,相同进行保存
    * 3.判断是否操作保存 1.当用的点击的返回按钮的时候,这里不进行的路由判断监控( vue内置bug)
    * 4.当用的已经点击保存成功了,直接通过
    * */
    if (md5(JSON.stringify(this.initform)) === md5(JSON.stringify(this.form)) && !this.form._id) {
      localStorage.setItem('htmlCode', '')
      next()
    } else if (md5(JSON.stringify(this.old_form)) === md5(JSON.stringify(this.form))) {
      localStorage.setItem('htmlCode', '')
      next()
    } else if (!this.isSave && !this.handleBack) {
      this.$confirm('检测到未保存的内容，是否在离开页面前保存修改？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '保存',
        cancelButtonText: '放弃修改'
      })
        .then(() => {
          this.handleSave(true) // 保存离开
          this.$message({
            type: 'info',
            message: '已保存修改'
          })
          localStorage.setItem('htmlCode', '')
          next()
        })
        .catch(action => {
          if (action === 'cancel') {
            // this.$router.go(-1)
            next()
          }
        })
    } else {
      localStorage.setItem('htmlCode', '')
      next()
    }
  },
  watch: {
    'form.vul_id' (val) {
      if (val) {
        this.form.submit_type = 'online'
      } else {
        this.form.submit_type = 'offline'
      }
    },
    pyPath (val) {
      localStorage.setItem('pyPath', val)
    },
    upload_plugin (val) {
      console.log(val)
      if (val) {
        this.show_downFile = false
      }
    },
    '$store.state.isOnline' (val) {
      if (val) { // 离线状态更改在线的状态

      } else { // 在线状态更改离线状态
        try {
          let obj = JSON.parse(this.form.name)
          console.log(obj)
          this.form.name = obj.name
        } catch (e) {
          console.log(e)
          this.form.name = name
        }
      }
    }
  },
  async mounted () {
    // this.form.submit_type = this.$route.query.type // 判断是新建或管理列表进行跳转过来
    this.mySwiper = new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      slidesPerView: 2,
      paginationClickable: true,
      spaceBetween: 30,
      noSwiping: true,
      keyboardControl: true,
      onSlideChangeEnd: (swiper) => {
        this.activeIndex = swiper.activeIndex
      }
    })
    this.getDetail()
    if (this.$store.state.isOnline) {
      this.getVulName()
    }
    this.getPulginType()
    document.dispatchEvent(new Event('render-event')) // todo dispathcEvent
    // let _this = this
    // if (this.form.submit_type === 'online') {
    //   await this.$sleep(1000)
    //   _this.$refs.name_select.$el.querySelector(
    //     '.el-select-dropdown').style.width = _this.$refs.name_select.$el.offsetWidth + 'px'
    //   window.onresize = function () { // 定义窗口大小变更通知事件
    //     _this.$refs.name_select.$el.querySelector(
    //       '.el-select-dropdown').style.width = _this.$refs.name_select.$el.offsetWidth + 'px'
    //   }
    // }
  },
  methods: {
    changeName () {
      console.log('input框发生改变')
      console.log(this.form.name)
      this.form.vul_id = ''
    },
    watchName (val) {
      console.log('改变了')
      try {
        if (val) {
          let obj = JSON.parse(val)
          this.form.vul_id = obj.vul_id
        } else {
          this.form.vul_id = ''
        }
      } catch (e) {
        this.form.vul_id = ''
        console.log(e)
      }
    },
    async checkFile () { // 检查文件的格式是否正确
      if (!this.pyPath) {
        this.$message.error('请填写本地python2.x路径')
        return false
      }
      console.log('验证通过了')
      if (!this.isCheck()) {
        this.$message.error('请先上传插件!')
        this.mySwiper.slideTo(0, 1000, false)
        return false
      }
      this.checkFileLoading = true
      let params = {
        // pyPath: this.$store.state.pyPath,
        fileName: this.$route.query._id ? this.$route.query._id : '',
        check_type: 'check', // 格式校验还是运行的运行检测web,server,check
        url: '',
        ip: '',
        port: '',
        source: this.sourceFun()
      }
      console.log(params)
      let res = await this.$checkPoc(params, 'check_format')
      if (res.indexOf('check function result') !== -1 && res.indexOf('Traceback') === -1) {
        this.form.check_info = 'success'
      } else {
        this.form.check_info = res
      }
      this.mySwiper.slideTo(2, 1000, false)
      this.checkFileLoading = false
    },
    isCheck () { // 判断是否可以进行的检测
      if (!this.$route.query._id) { // 新建数据
        if (this.upload_plugin) {
          return true
        } else {
          return false
        }
      } else { // 来自管理列表
        if (this.upload_plugin) {
          return true
        } else {
          if (this.form.saved_plugin) { // 进行确定是否保存插件
            return true
          } else {
            return false
          }
        }
      }
    },
    sourceFun () {
      if (!this.$route.query._id) { // 新建数据
        if (this.upload_plugin) return 'cache'
      } else { // 来自管理列表
        if (this.upload_plugin) {
          return 'cache'
        } else {
          if (this.form.saved_plugin) { // 进行确定是否保存插件
            return 'file'
          }
        }
      }
    },
    async handleCheck () { // 验证有没有漏洞
      this.form.check_res = ''
      let flag = true
      if (this.form.check_type === 'web') {
        this.$refs['form_check'].validateField('url', (valid) => {
          flag = !valid
        })
      } else {
        this.$refs['form_check'].validateField('ip', (valid) => {
          flag = !valid
        })
        this.$refs['form_check'].validateField('port', (valid) => {
          flag = !valid
        })
      }
      if (!flag) return false
      if (!this.isCheck()) {
        this.$message.error('请先上传插件!')
        this.mySwiper.slideTo(0, 1000, false)
        return false
      }
      this.check_loading = true
      let params = {
        // pyPath: this.$store.state.pyPath,
        fileName: this.$route.query._id ? this.$route.query._id : '',
        check_type: this.form.check_type,
        url: this.form.url,
        ip: this.form.ip,
        port: this.form.port,
        source: this.sourceFun()
      }
      this.form.check_res = await this.$checkPoc(params, 'detect_uri')
      this.mySwiper.slideTo(3, 1000, false)
      this.check_loading = false
    },
    getBlobBydataURI (dataURI, type) {
      var binary = dataURI.split(',')[1]
      var array = []
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      console.log(array)
      return new Blob([new Uint8Array(array)], {type: type})
    },
    ReceiveFile (val) {
      this.form.DirTree = []
      deleteFolder(path.join(remote.app.getPath('userData'), './poc/cache'))
      let _this = this
      let render = new FileReader()
      render.readAsDataURL(val)
      console.log(val)
      render.onload = function (e) {
        console.log(this.result)
        _this.$Blob = _this.getBlobBydataURI(this.result, val.type)
        console.log(_this.$Blob)
        _this.form.plugin_name = val.name
        _this.copy_file(val.path, val.name.match(/\.(\w+)$/)[0], val.name)
      }
    },
    copy_file (cpath, type, name) { // 将文件复制到本地
      let _this = this
      fs.readFile(cpath, function (err, data) {
        if (err) console.log(err)
        console.log(data)
        let bufferResult = new Buffer(data)
        let PocPath = path.join(remote.app.getPath('userData'), 'poc/cache')
        fs.mkdir(`${PocPath}`, function (err) {
          if (err) {
            console.log(err)
            return false
          } else {
            fs.writeFile(`${PocPath}/main${type}`, bufferResult, function (err) { // 都存储为main.xx文件
              if (err) {
                return false
              } else {
                console.log('写入成功!')
                _this.mySwiper.slideTo(1, 1000, false)
                _this.upload_plugin = true
                if (type === '.zip') { // 如果的是zip进行压缩
                  _this.handleCompressing(cpath, type, name)
                } else { // .py不用处理
                  _this.form.DirTree = [{label: name}]
                  console.log(_this.form.DirTree)
                }
              }
            })
          }
        })
      })
    },
    handleCompressing (cpath, type, name) { // 解压压缩文件
      let _this = this
      let PocPath = path.join(remote.app.getPath('userData'), './poc/cache')
      // 解压缩
      compressing.zip.uncompress(`${PocPath}/main.zip`, PocPath)
        .then(() => {
          console.log('解压成功')
          _this.form.DirTree = geFileList(path.join(remote.app.getPath('userData'), './poc/cache'))
          console.log(_this.form.DirTree)
        })
        .catch(err => {
          this.$message.error('上传插件文件错误!')
          console.log(err)
        })
    },
    getPulginType () {
      if (this.$store.state.isOnline) {
        this.$post('/vulnerability?act=get_vul_p_type_dict_handler').then(res => {
          if (res.errcode === '0') {
            this.vulType = res.data
          } else {
            this.$message.error(res.message)
          }
        }).catch(error => {
          console.log(error)
        })
      } else {
        this.vulType = this.plugin_type
      }
    },
    formateQuery (query) {
      let result = query.match(/"(.*?)"/g)
      return result.map(function (element) {
        return element.match(/"(.*)"/)[1]
      })
    },
    async generateFile () {
      let _this = this
      if (!this.form.name) {
        this.$message.error('请填写漏洞名称')
      } else if (!this.form.vul_type) {
        this.$message.error('请填写类型')
      } else if (!this.form.query) {
        this.$message.error('请填写受影响实体')
      } else {
        if (!_this.$store.state.isOnline) {
          let tplFile = ''
          if (this.vul_type === 'weak-pass') { // 判断弱口令模板
            tplFile = 'weak_tmp_main.py'
          } else {
            tplFile = 'tmp_main.py'
          }
          let pyTxt = fs.readFileSync(path.join(__static, `./template/${tplFile}`), 'utf-8')
          pyTxt = pyTxt
            .replace(/{mapx: author}/g,
              _this.$store.state.userInfo.user_name ? _this.$store.state.userInfo.user_name : 'mapx')
            .replace(/{mapx: query}/g, _this.form.query)
            .replace(/{mapx: createDate}/g, _this.$formatTime(new Date().getTime()).date)
            .replace(/{mapx: updateDate}/g, _this.$formatTime(new Date().getTime()).date)
            .replace(/{mapx: vultype}/g, _this.form.vul_type)
            .replace(/{mapx: name}/g, _this.form.name)
            .replace(/\['{mapx: query_list}'\]/g, JSON.stringify(_this.formateQuery(_this.form.query)))
          console.log(pyTxt)
          fs.writeFileSync(path.join(remote.app.getPath('userData'), `./tmp_main_cache.py`), pyTxt)
          fs.readFile(path.join(remote.app.getPath('userData'), `./tmp_main_cache.py`),
            function (err, data) {
              if (err) throw err
              console.log(data)
              let Bolb = new Blob([new Uint8Array(data)], {type: 'application/octet-stream'})
              console.log(Bolb)
              _this.downFile(Bolb, 'main.py')
            })
          return false
        }
        let params
        if (this.old_form) { // 返回详情数据
          if (this.JSONFun(this.form.name)) { // 返回详情后,用户去修改漏洞名称
            params = {...this.form, name: this.JSONFun(this.form.name).name}
          } else { // 这里的获取的详情返回的
            params = {...this.form, name: this.old_form.name}
          }
        } else { // 第一次进行提交
          params = {...this.form, name: this.JSONFun(this.form.name).name}
        }
        let res = await this.$post('/plugin?act=cre_poc_tmp_handler', params) // 拦截重定向为跳转到登录页面
        console.log(res)
        if (res.errcode === '0') {
          this.handledownFile(res.data)
        } else {
          console.log('更多......')
          this.$message.error(res.errmsg)
        }
      }
    },
    JSONFun (str) {
      try {
        return JSON.parse(str)
      } catch (e) {
        console.log(e)
        return ''
      }
    },
    downPluginFile () {
      let _this = this
      let filePath
      let suffix = this.form.plugin_name.match(/.+\.(\w+)$/)[1]
      if (suffix === 'zip') {
        filePath = `${this.form._id}/main.zip`
      } else {
        filePath = `${this.form._id}/main.py`
      }
      fs.readFile(path.join(remote.app.getPath('userData'), `./poc/${filePath}`),
        function (err, data) {
          if (err) throw err
          let Bolb = new Blob([new Uint8Array(data)], {type: 'application/octet-stream'})
          console.log(Bolb)
          _this.downFile(Bolb, _this.form.plugin_name)
        })
    },
    handledownFile (id) {
      let params = {
        plugin_id: id
      }
      // 下载word
      this.$post('/plugin?act=download_poc_tmp_handler', params, {responseType: 'blob'}).then(res => {
        console.log(res)
        if (res.errmsg) {
          this.$message.error(res.errmsg)
        } else {
          let blob = new Blob([res], {type: 'application/octet-stream'})
          console.log(blob)
          this.downFile(blob, `main.py`)
        }
      }).catch((error) => {
        this.$message.error(error)
      })
    },
    downFile (blob, fileName) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName)
      } else {
        // 自定义事件，dispaatchEvent(evt)
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        // 此写法兼容可火狐浏览器
        document.body.appendChild(link)
        let evt = document.createEvent('MouseEvents')
        evt.initEvent('click', false, false)
        link.dispatchEvent(evt)
        document.body.removeChild(link)
      }
    },
    async remoteMethod (query) {
      if (query !== '') {
        this.loading = true
        console.log('触发了222')
        await this.getVulName(query)
        // console.log(this.vulName)
        this.loading = false
      } else {
        this.vulName = this.oldName
      }
    },
    getVulName (query) {
      return new Promise(async resolve => {
        let params = {
          use_for: '',
          vul_name: query
        }
        let res = await this.$post('vulnerability?act=get_all_vul_name_handler', params)
        console.log(res)
        this.loading = false
        if (res.errcode === '0') {
          this.oldName = {...res.data}
          this.vulName = res.data
          resolve(res.data)
        } else {
          this.$message.error(res.errmsg)
        }
      })
    },
    errReg (val) {
      this.Regerr = val
    },

    getSelectItem (value) {
      let choosenItem = this.web_dict.filter(item => item.slug === value)[0]
      this.form.dict_id = choosenItem._id
      this.form.dict_cn = choosenItem.chinese
    },

    backStep () {
      if (md5(JSON.stringify(this.initform)) === md5(JSON.stringify(this.form)) && !this.form._id) {
        this.$router.go(-1)
        return false
      } else if (md5(JSON.stringify(this.old_form)) === md5(JSON.stringify(this.form))) {
        this.$router.go(-1)
        return false
      }
      this.handleBack = true
      /* 点击返回 */
      let flag = this.form.name
      if (this.isSave) { // 成功点击保存信息后直接退出
        this.$router.go(-1)
        return false
      }
      if (flag) { // 没有验证通过情况
        this.$confirm('检测到未保存的内容，是否在离开页面前保存修改？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '保存',
          cancelButtonText: '放弃修改'
        })
          .then(() => {
            this.handleSave(true) // 保存离开
            this.$router.go(-1)
            this.$message({
              type: 'info',
              message: '已保存修改'
            })
          })
          .catch(action => {
            if (action === 'cancel') {
              this.$router.go(-1)
            }
          })
      } else {
        this.$router.go(-1)
      }
    },

    getDetail () {
      if (this.$route.query._id) {
        let _id = this.$route.query._id
        console.log(this.$route.query._id)
        this.$searchPlugin({_id: _id}).then((res) => {
          this.show_downFile = res.data[0].saved_plugin
          console.log(res.data[0])
          this.old_form = this.form = {
            ...res.data[0],
            DirTree: JSON.parse(res.data[0].DirTree)
          }
        })
      }
    },

    handleSave (cancel) {
      let flag = true
      this.$refs['form'].validateField('name', (valid) => {
        flag = !valid
      })
      if (flag) {
        // if (this.form.submit_type === 'online') {
        //   if (this.old_form) { // 返回详情数据
        //     console.log(this.form.name)
        //     if (this.JSONFun(this.form.name)) { // 返回详情后,用户去修改漏洞名称
        //       let res = this.form.name
        //       this.form.name = this.JSONFun(res).name
        //       this.form.vul_id = this.JSONFun(res).vul_id
        //       this.form.CVE = this.JSONFun(res).CVE ? this.JSONFun(res).CVE : ''
        //     } else { // 这里的获取的详情返回的
        //       this.form.name = this.old_form.name
        //       this.form.CVE = this.old_form.CVE
        //     }
        //   } else {
        //     let res = this.form.name
        //     console.log(JSON.parse(res))
        //     this.form.name = this.JSONFun(res).name
        //     this.form.CVE = this.JSONFun(res).CVE ? this.JSONFun(res).CVE : ''
        //   }
        // }
        if (this.JSONFun(this.form.name)) {
          let res = this.form.name
          this.form.name = this.JSONFun(res).name
          this.form.vul_id = this.JSONFun(res).vul_id
          this.form.CVE = this.JSONFun(res).CVE ? this.JSONFun(res).CVE : ''
        }
        let saveForm = {
          ...this.form,
          saved_plugin: this.form.saved_plugin ? true : this.upload_plugin,
          use_flag_e: this.form.use_flag,
          DirTree: JSON.stringify(this.form.DirTree)
        }
        this.$savePlugin(saveForm).then((res) => {
          console.log(res)
          this.isSave = true // 保存成功,可以直接点击返回按钮
          this.old_form = this.form = {
            ...res,
            DirTree: JSON.parse(res.DirTree),
            name: res.name + (res.CVE ? `(${res.CVE})` : ''),
            use_flag: res.use_flag_e,
            vul_type: res.vul_type
          }
          // 保存成功后去的_号,进行新建文件 upload_plugin:ture,代表新上传文件,
          if (this.upload_plugin) {
            this.createPluginFile(res._id) // 將cache进行复制的到的对象id文件内
          }
          if (!cancel) {
            this.$message.success('已保存')
          }
        })
      } else {
        this.$message({
          message: '保存前请先选择漏洞名称',
          type: 'warning'
        })
      }
    },
    createPluginFile (_id) {
      deleteFolder(path.join(remote.app.getPath('userData'), `./poc/${_id}`))
      copyFolder(path.join(remote.app.getPath('userData'), './poc/cache'),
        path.join(remote.app.getPath('userData'), `./poc/${_id}`))
      console.log('复制成功')
      this.changeFileType(_id)
    },
    changeFileType (_id) {
      // 改变文件类型的读取id文件是是不是的一个的单独的的main.py文件
      let arrPath = fs.readdirSync(path.join(remote.app.getPath('userData'), `./poc/${_id}`))
      console.log(arrPath)
      if ((arrPath.length === 1 && arrPath[0] === 'main.py') ||
        (arrPath.length === 2 && arrPath.includes('main.pyc'))) {
        console.log('单个文件')
        compressing.zip.compressFile(path.join(remote.app.getPath('userData'), `./poc/${_id}/main.py`),
          path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`))
          .then(() => {
            console.log('压缩成功')
          })
          .catch((e) => {
            console.log(e)
            console.log('压缩失败')
          })
      } else {
        console.log('多个文件')
        fs.rename(path.join(remote.app.getPath('userData'), `./poc/${_id}/main.zip`),
          path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`), function (err) {
            if (err) {
              console.log('重命名失败！')
            } else {
              console.log('重命名成功！')
            }
          })
      }
    },
    handleCopy (text) {
      if (!text) return
      this.$copyText(text).then((e) => {
        this.$message.success('复制成功')
      }, (e) => {
        console.log(e)
      })
    },
    BreadCrumb (val) { // 操作函数类型
      if (val === 'pre') {
        this.mySwiper.slidePrev()
      } else if (val === 'next') {
        this.mySwiper.slideNext()
      } else if (val === 'save') {
        this.handleSave()
      }
    },
    goNext (val) {
      if (val === 'prev') {
        this.mySwiper.slidePrev()
      } else if (val === 'next') {
        this.mySwiper.slideNext()
      }
    }
  },
  components: {
    Breadcrumb,
    Upload
  }
}
</script>

<style lang="less">
	@import '../../../renderer/assets/style/flex.less';
	
	.finger_web {
		.el-table .success-row {
			background: #f0f9eb;
		}
		
		.swiper-title {
			margin-bottom: 16px;
			font-size: 16px;
		}
		
		.btn-box {
			display: flex;
			flex-direction: row;
		}
		
		.handle_btn {
			width: 100%;
			border: 0;
		}
		
		.dash_textarea {
			textarea {
				border: 2px dashed #d4dAE2;
			}
		}
		
		.text-container {
			width: 300px;
			height: 400px;
			border: 1px solid yellow;
		}
		
		.swiper-container {
			width: 100%;
			height: 100%;
			padding-bottom: 40px;
		}
		
		.swiper-slide {
			border: 1px solid #E6EAEE;
			padding: 16px;
			border-radius: 5px;
			font-size: 18px;
			background: #fff;
			overflow: auto;
			.flex-def;
			.flex-v;
		}
		
		.flex(1);
		.flex-def;
		.flex-v;
		
		.container {
			flex: 1;
			.flex-def;
			background: #fff;
			padding: 24px 30px 10px;
		}
		
		.identify_success {
			font-size: 15px;
			color: #3DBD7D
		}
		
		.identify_fail {
			font-size: 15px;
			color: #D0021B;
		}
		
		.el-dialog__body {
			padding: 0;
		}
		
		.finger_detail {
			& > .el-dialog {
				padding: 0 20px
			}
		}
	}
</style>

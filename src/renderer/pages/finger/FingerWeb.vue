<template>
	<div class="finger_web">
		<breadcrumb @backStep="backStep" @BreadCrumb="BreadCrumb" class="breadTitle"></breadcrumb>
		<div class="container">
			<div class="swiper-container">
				<div class="swiper-wrapper">
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width" :model="form" :rules="rules" ref="form" label-width="100px" size="small">
							<h3 class="swiper-title">基本信息</h3>
							<el-form-item label="指纹名称：" prop="name">
								<el-input placeholder="西门子PLC SIMATIC S7-1200" size="medium"
													v-model.trim="form.name"></el-input>
							</el-form-item>
							<el-form-item label="指纹分类：" prop="type_dict">
								<el-select
									@change="getSelectItem"
									:popper-append-to-body="false"
									:disabled="disabled"
									placeholder="请选择指纹分类"
									size="medium"
									style="width: 100%"
									clearable
									v-model="form.type_dict"
									filterable>
									<el-option
										v-for="item in type_dict"
										:key="item._id"
										:label="item.chinese"
										:value="item.slug">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="厂商：" prop="manufacturer">
								<el-select
									:popper-append-to-body="false"
									style="width: 100%"
									size="medium"
									v-model="form.manufacturer"
									filterable
									:allow-create="true"
									clearable
									remote
									placeholder="请选择厂商"
									:remote-method="getVendorOption"
									:loading="Man_loading">
									<el-option
										v-for="item in VendorOption"
										:key="item._id"
										:label="item.vendor"
										:value="item.vendor">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="识别名称：" prop="rec_name">
								<el-input placeholder="请输入识别名称，如 Siemens Simatic S7-1200 PLC" size="medium"
													v-model.trim="form.rec_name"></el-input>
							</el-form-item>
							<el-form-item label="指纹简介：" prop="introduction">
								<el-input
									:disabled="disabled"
									type="textarea"
									rows="8"
									placeholder="请输入指纹简介"
									v-model="form.introduction">
								</el-input>
							</el-form-item>
						</el-form>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form" size="small">
							<h3 class="swiper-title">探测目标</h3>
							<el-form-item prop="address" label="">
								<el-input
									:disabled="disabled"
									type="textarea"
									:rows="20"
									placeholder="请输入单个探测目标，例如
http://URL
http://IP:端口"
									v-model="form.address">
								</el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" plain :loading="detect_loading" @click="handleProbe()">
								{{detect_loading?'正在探测':'探测'}}
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form">
							<h3 class="swiper-title">回包信息</h3>
							<el-form-item prop="introduction" label="">
								<el-input
									:readonly="true"
									ref="returnPackage"
									class="dash_textarea"
									:disabled="disabled"
									type="textarea"
									:rows="18"
									v-model="form.return_headers">
								</el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px" class="btn-box">
							<el-button class="handle_btn" type="info" plain @click="$creatNewWin('HtmlCode')">查看HTML源码</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :rules="identify_rule" :model="form" label-width="100px"
										 size="small">
							<h3 class="swiper-title">识别规则</h3>
							<input-add @errReg="errReg" @emitVal="headersVal" :value="headers" :config="headersConfig"
												 :size="'small'"></input-add>
							<input-add @errReg="errReg" @emitVal="htmlVal" :value="html" :config="htmlConfig"
												 :size="'small'"></input-add>
							<el-form-item label="url：" prop="url">
								<el-input :disabled="disabled" v-model="form.url"
													:placeholder='"^https?//.+\\.wordpress\\.com"'></el-input>
							</el-form-item>
							<input-add @errReg="errReg" @emitVal="scriptVal" :value="script" :size="'small'"
												 :config="scriptConfig"></input-add>
							<input-add @errReg="errReg" @emitVal="metaVal" :value="meta" :config="metaConfig"
												 :size="'small'"></input-add>
							<input-add @errReg="errReg" @emitVal="jsVal" :value="js" :config="jsConfig" :size="'small'"></input-add>
							<el-form-item label="相关：" prop="implies">
								<el-select
									:disabled="disabled"
									multiple
									filterable
									style="width:100%"
									v-model="form.implies"
								>
									<el-option
										v-for="(item,a) in relatedData"
										:key="a"
										:label="item.app_name"
										:value="item.app_name">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="不相关：" prop="excludes">
								<el-select
									:disabled="disabled"
									multiple
									filterable
									style="width:100%"
									v-model="form.excludes">
									<el-option
										v-for="(item,b) in relatedData"
										:key="b"
										:label="item.app_name"
										:value="item.app_name">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="CPE信息：" prop="cpe">
								<el-input
									type="input"
									placeholder="cpe:/a:pureftpd:pure-ftpd:0.91"
									v-model="form.CPE">
								</el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" @click="handleIdetify" :loading="identify_loading" plain>
								{{identify_loading?'正在识别':'识别'}}
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form" label-width="100px"
										 size="small">
							<h3 class="swiper-title">识别结果</h3>
							<div v-for="(items,val,i) in form.result_idetify" :key="i">
								<el-form-item :label="val+':'" prop="url">
									<div v-for="(item,index) in items" :key="index">
										<span style="height:35px;display: block"
													:class="{green:item==='pass',grey:item==='none',red:item==='unpass'}"> {{item==='pass'? '通过':item==='unpass'?'未通过':'无'}}</span>
									</div>
								</el-form-item>
							</div>
						</el-form>
						<div style="height:38px" class="btn-box">
							<el-button class="handle_btn" type="info" plain @click="dialogTableVisible = true">查看指纹详情</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<el-form class="co_form_width flex_form" :model="form">
							<h3 class="swiper-title">指纹编码</h3>
							<el-form-item prop="introduction" label="">
								<el-input
									ref="fingerCoding"
									class="dash_textarea"
									:readonly="true"
									type="textarea"
									:rows="18"
									v-model="form.fingerCoding">
								</el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" plain @click="handleCopy(form.fingerCoding)">复制</el-button>
						</div>
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
		
		<!-- 查看html代码 ace编辑器 -->
		<!-- <el-dialog
			title="HTMl源码"
			:visible.sync="dialogVisible"
			width="80%">
			<ace :value="form.return_html" v-if="dialogVisible" :size="[16,24]"></ace>
			<span slot="footer" class="dialog-footer">
    	<el-button size="small" @click="dialogVisible = false">取 消</el-button>
  		</span>
		</el-dialog> -->
		<el-dialog
			class="finger_detail"
			title="指纹详情"
			:visible.sync="dialogTableVisible"
			width="80%">
			<el-table :data="fingerList" :row-class-name="tableRowClassName">
				<el-table-column prop="name" label="识别名称" width="150">
				</el-table-column>
				<el-table-column prop="versions" label="版本" width="200">
					<template slot-scope="scope">
						{{versionFun(scope)}}
					</template>
				</el-table-column>
				<el-table-column prop="category" label="分类">
					<template slot-scope="scope">
						{{scope.row.category.join(',')}}
					</template>
				</el-table-column>
			</el-table>
			<span slot="footer" class="dialog-footer">
    	<el-button size="small" @click="dialogTableVisible = false">关 闭</el-button>
  		</span>
		</el-dialog>
	
	</div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import Swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'
import InputAdd from '@/components/input_add'
import checkFP from '../../../../static/wappalyzer/server'
import md5 from 'blueimp-md5'

// var chardet = require('chardet')
var jschardet = require('jschardet')
var encoding = require('encoding')
let iconv = require('iconv-lite')
let fs = require('fs')
let path = require('path')
process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser
let request = require('request')
// let http = require('http')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
export default {
  data () {
    return {
      Regerr: false,
      toStep: '', // 控制路由返回上一步
      fromStep: '',
      form: {
        type: 'web', // 指纹类型
        name: '',
        type_dict: '', // 指纹分类
        manufacturer: '', // 厂商
        rec_name: '', // 识别名称
        introduction: '', // 指纹简介
        address: '', // 探测目标
        return_headers: '', // 响应响应头
        return_html: '', // 响应的html
        implies: [],
        excludes: [],
        CPE: '',
        headers: '', // obj
        html: '', // 数组
        url: '',
        script: '', // 数组
        meta: '',
        js: '',
        fingerCoding: '',
        result_idetify: '',
        log_pass_num: 0,
        log_unpass_num: 0,
        log_pass_info: '',
        log_unpass_info: '',
        log_ratio: 0,
        dict_id: '',
        dict_cn: ''
      },
      initform: {
        type: 'web', // 指纹类型
        name: '',
        type_dict: '', // 指纹分类
        manufacturer: '', // 厂商
        rec_name: '', // 识别名称
        introduction: '', // 指纹简介
        address: '', // 探测目标
        return_headers: '', // 响应响应头
        return_html: '', // 响应的html
        implies: [],
        excludes: [],
        CPE: '',
        headers: '', // obj
        html: '', // 数组
        url: '',
        script: '', // 数组
        meta: '',
        js: '',
        fingerCoding: '',
        result_idetify: '',
        log_pass_num: 0,
        log_unpass_num: 0,
        log_pass_info: '',
        log_unpass_info: '',
        log_ratio: 0,
        dict_id: '',
        dict_cn: ''
      },
      old_form: '',
      type_dict: require('../../../../static/json/web_fin_dict.json').RECORDS, // 服务指纹分类
      sourceHtml: '', // html源码
      rules: {
        name: [
          {required: true, trigger: 'blur', message: '请输入指纹名称'}, {
            validator: async (rule, value, callback) => {
              if (!value) {
                callback()
                // } else if (/^[A-Za-z0-9_\u4E00-\u9FA5\s.-]+$/.test(value)) {
              } else if (value) {
                let res = await this.$findOne({name: value})
                if (res && this.form.name !== this.old_form.name) {
                  callback(new Error('名称已存在'))
                } else {
                  callback()
                }
              } else {
                callback(new Error('请填写指纹!'))
              }
            }
          }],
        type_dict: [{required: true, trigger: 'change', message: '请选择指纹分类'}],
        manufacturer: [{required: true, trigger: 'change', message: '请选择厂商'}],
        rec_name: [
          {required: true, trigger: 'blur', message: '请输入识别名称'}, {
            validator: async (rule, value, callback) => {
              if (!value) {
                callback()
                // } else if (/^[A-Za-z0-9_\u4E00-\u9FA5\s.-]+$/.test(value)) {
              } else if (value) {
                let res = await this.$findOne({rec_name: value})
                if (res && this.form.rec_name !== this.old_form.rec_name) {
                  callback(new Error('名称已存在'))
                } else {
                  callback()
                }
                callback()
              } else {
                callback(new Error('识别名称只能是字母、数字、下划线'))
              }
            }
          }
        ],
        introduction: [{required: true, trigger: 'blur', message: '请输入指纹简介'}]
      },
      identify_rule: {
        url: [
          {trigger: 'blur', message: '请检查格式是否正确'}, {
            validator: (rule, value, callback) => {
              if (value) {
                try {
                  if (!this.$checkRegex(value)) {
                    this.Regerr = true
                    callback(new Error('请检查格式是否正确!'))
                  } else {
                    this.Regerr = false
                    callback()
                  }
                } catch (e) {
                  console.log(e)
                  this.Regerr = true
                  callback(new Error('请检查格式是否正确'))
                }
              } else {
                callback()
              }
            }
          }]
      },
      disabled: false,
      mySwiper: '',
      activeIndex: 0,
      Man_loading: false,
      VendorOption: [],
      /* 添加多个 */
      headers: [],
      html: [],
      script: [],
      meta: [],
      js: [],
      headersConfig: {
        label: 'headers',
        disabled: this.$route.query.type === 'viewDetail',
        placeholder: this.$route.query.type === 'viewDetail' ? '' : 'X-Powered-By: ^WordPress$',
        type: 'obj'
      },
      metaConfig: {
        label: 'meta',
        disabled: this.$route.query.type === 'viewDetail',
        placeholder: this.$route.query.type === 'viewDetail' ? '' : 'generator: ^WordPress$',
        type: 'obj'
      },
      jsConfig: {
        label: 'js',
        disabled: this.$route.query.type === 'viewDetail',
        // placeholder: this.$route.query.type === 'viewDetail' ? '' : '"js":{"Mage":"\\\\;confidence:50"}'
        placeholder: this.$route.query.type === 'viewDetail' ? '' : 'Mage:\\;confidence:50',
        type: 'obj'
      },
      htmlConfig: {
        label: 'html',
        disabled: this.$route.query.type === 'viewDetail',
        // placeholder: this.$route.query.type === 'viewDetail' ? '' : '"<a [^>]*href=\\"index.html"'
        placeholder: this.$route.query.type === 'viewDetail' ? '' : '<a [^>]*href=\\"index.html'

      },
      scriptConfig: {
        label: 'script',
        disabled: this.$route.query.type === 'viewDetail',
        placeholder: this.$route.query.type === 'viewDetail'
          ? ''
          : 'jquery-([0-9.]+)\\.js\\;version:\\1'
      },
      relatedData: require('../../../../static/json/web_fin_related.json').RECORDS, // 相关
      web_dict: require('../../../../static/json/web_fin_dict.json').RECORDS,
      dialogVisible: false,
      dialogTableVisible: false,
      isSave: false, // 是否点击过保存按钮,
      handleBack: false, // 是否点击返回按钮
      fingerList: [],
      identify_loading: false, // 识别的loading
      detect_loading: false, // 探测loading,
      showResult: false // 显示识别结果
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
      this.$store.commit('updateHtmlCode', '')
      next()
    } else if (md5(JSON.stringify(this.old_form)) === md5(JSON.stringify(this.form))) {
      this.$store.commit('updateHtmlCode', '')
      next()
    } else if (!this.isSave && !this.handleBack) {
      this.$confirm('检测到未保存的内容，是否在离开页面前保存修改？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '保存',
        cancelButtonText: '放弃修改'
      })
        .then(() => {
          this.handleSave(true) // 保存离开
          // this.$router.go(-1)
          this.$message({
            type: 'info',
            message: '已保存修改'
          })
          this.$store.commit('updateHtmlCode', '')
          next()
        })
        .catch(action => {
          if (action === 'cancel') {
            // this.$router.go(-1)
            next()
          }
        })
    } else {
      this.$store.commit('updateHtmlCode', '')
      next()
    }
  },
  watch: {
    'form.implies': {
      handler: function (val) {
        if (typeof val !== 'string') {
          if (this.form.excludes.length !== 0 && val.length > 0) {
            for (let i of val) {
              let a = this.form.excludes.indexOf(i)
              if (a >= 0) {
                this.form.excludes.splice(a, 1)
              }
            }
          }
        }
      },
      deep: true
    },
    'form.excludes': {
      handler: function (val) {
        if (typeof val !== 'string') {
          if (this.form.implies.length !== 0 && val.length > 0) {
            for (let i of val) {
              let a = this.form.implies.indexOf(i)
              if (a >= 0) {
                this.form.implies.splice(a, 1)
              }
            }
          }
        }
      },
      deep: true
    }
  },
  async mounted () {
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
    /* copy功能 */
    /* this.$refs.returnPackage.$el.onclick = () => {
      this.handleCopy(this.form.return_headers)
    }
    this.$refs.fingerCoding.$el.onclick = () => {
      this.handleCopy(this.form.fingerCoding)
    } */
    this.getDetail()
  },
  methods: {
    versionFun (scope) {
      if (scope.row) {
        let arr = scope.row.versions
        for (let i in arr) {
          if (arr[i] === '\\1') {
            arr[i] = '未匹配'
          }
        }
        return arr.join('，')
      }
    },
    tableRowClassName (row, rowIndex) {
      if (row.row.name === this.form.rec_name) {
        return 'success-row'
      }
      return ''
    },
    errReg (val) {
      this.Regerr = val
    },
    getSelectItem (value) {
      console.log('改变了')
      let choosenItem = this.web_dict.filter(item => item.slug === value)[0]
      console.log(choosenItem)
      if (choosenItem) {
        this.form.dict_id = choosenItem._id
        this.form.dict_cn = choosenItem.chinese
      } else {
        this.form.dict_id = ''
        this.form.dict_cn = ''
      }
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
      console.log(this.form)
      if (this.$route.query._id) {
        let _id = this.$route.query._id
        console.log(this.$route.query._id)
        this.$search({_id: _id}).then((res) => {
          console.log(res.data[0])
          this.old_form = {...res.data[0]}
          this.form = {...res.data[0]}
          this.headers = this.objArray(res.data[0].headers ? res.data[0].headers : '')
          this.html = this.strArray(res.data[0].html && res.data[0].html[0] ? res.data[0].html : '')
          this.script = this.strArray(res.data[0].script && res.data[0].script[0] ? res.data[0].script : '')
          this.meta = this.objArray(res.data[0].meta ? res.data[0].meta : '')
          this.js = this.objArray(res.data[0].js ? res.data[0].js : '')
        })
      }
    },
    handleSave (cancel) {
      let flag = true
      this.$refs['form'].validateField('name', (valid) => {
        flag = !valid
      })
      if (flag) {
        let saveForm = {...this.form, return_html: ''}
        let identifyRule = {
          headers: this.form.headers,
          html: this.form.html,
          url: this.form.url,
          script: this.form.script,
          meta: this.form.meta,
          js: this.form.js,
          implies: this.form.implies,
          excludes: this.form.excludes,
          CPE: this.form.CPE
        }
        let descryptStr = this.$StrDecrypt(this.form.fingerCoding)
        if (descryptStr !== JSON.stringify(identifyRule) && this.$route.query._id) { // 针对的离线模式的
          this.$message.error('识别规则修改后，未点击下方的识别按钮，请点击后保存!')
          return false
        }
        console.log(saveForm)
        this.$save(saveForm).then((res) => {
          this.isSave = true // 保存成功,可以直接点击返回按钮
          this.form = {...res}
          this.old_form = {...res} // 保存成功后进行赋值
          if (!cancel) {
            this.$message.success('已保存')
          }
        })
      } else {
        this.$message({
          message: '保存前，请先填写指纹名称',
          type: 'warning'
        })
      }
      this.saveVendeor(this.form.manufacturer)
    },
    saveVendeor (manufacturer) {
      if (manufacturer) {
        this.$vendorSearch(manufacturer, true).then((res) => {
          if (!(res.data && res.data.length > 0)) {
            this.$vendorSave({vendor: manufacturer}).then((res) => {
              console.log(res)
            })
          }
        })
      }
    },
    handleHttp () {
      request.get({
        url: this.form.address,
        encoding: null // 让body 直接是buffer
      }, function (err, response, body) {
        var info = jschardet.detect(body)
        let resultBuffer = encoding.convert(body, 'UTF-8', info.encoding)
        let str = iconv.decode(resultBuffer, 'UTF-8')
        console.log(str)
        console.log(err)
      })
    },
    handleProbe () {
      // this.handleHttp()
      this.form.return_headers = ''
      this.form.return_html = ''
      if (!this.form.address) {
        this.$message.error('请先填写探测目标')
        return false
      }
      this.detect_loading = true
      let _this = this
      let options = {
        url: _this.form.address,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
        },
        debug: false,
        maxRedirects: 5,
        // 禁止跳转，防SSRF
        followRedirect: false,
        timeout: 10000
        // proxy: 'http://127.0.0.1:8080'
      }
      // console.log(_this.$store.state.proxy)
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
      // request = request.defaults({'proxy': _this.$store.state.proxy})
      request.get(options, function (error, response, body) { // 判断返回编码的格式
        console.log('已发起请求!')
        console.log(error)
        let str = ''
        try {
          let info = jschardet.detect(body)
          let resultBuffer = encoding.convert(body, 'UTF-8', info.encoding)
          str = iconv.decode(resultBuffer, 'UTF-8')
        } catch (e) {
          this.detect_loading = false
          console.log(e)
        }
        if (error) {
          console.log(error)
          console.log(error.message)
          _this.detect_loading = false
          _this.form.return_headers = ''
          _this.fingerList = []
          _this.$store.commit('updateHtmlCode', '')
          if (error.code === 'ESOCKETTIMEDOUT' || error.code === 'ETIMEDOUT') {
            _this.$alert('探测超时,请稍后再试!', '提示', {
              confirmButtonText: '关闭',
              type: 'warning'
            })
          } else if (error.code === 'EPROTO') {
            _this.$alert('SSL证书失效,请将https修改http,进行探测!', '提示', {
              confirmButtonText: '关闭',
              type: 'warning'
            })
          } else {
            _this.$message.error('探测失败,请检查探测目标是否正确!')
          }
          console.log('error:', error) // Print the error if one occurred
          return
        }
        if (_this.activeIndex === 0) {
          _this.mySwiper.slideNext()
        }
        _this.form.return_html = str
        /* 进行文本转化,进行 */
        let returnHeaderArr = []
        let headers = response.headers
        console.log(response.headers)
        Object.keys(headers).forEach((key, index) => {
          returnHeaderArr.push(`${key}:${headers[key]}`)
        })
        let headersText = ''
        for (let i in returnHeaderArr) {
          headersText += `${Number(i) + 1}、${returnHeaderArr[i]}\r\n`
        }
        _this.form.return_headers = headersText
        _this.detect_loading = false
        _this.$store.commit('updateHtmlCode', _this.form.return_html)
      })
    },
    /* 处理厂商 */
    getVendorOption (query) {
      if (query !== '') {
        this.Man_loading = true
        setTimeout(() => {
          this.Man_loading = false
          this.$vendorSearch(query).then((res) => {
            this.VendorOption = res.data
          })
        }, 200)
      } else {
        this.VendorOption = []
        //  待定
      }
    },
    headersVal (val) {
      this.form.headers = this.handleObject(val) ? this.handleObject(val) : ''
    },
    metaVal (val) {
      console.log(val)
      this.form.meta = this.handleObject(val) ? this.handleObject(val) : ''
      console.log(this.form.meta)
    },
    jsVal (val) {
      this.form.js = this.handleObject(val) ? this.handleObject(val) : ''
    },
    htmlVal (val) {
      this.form.html = this.handleString(val) ? this.handleString(val) : ''
    },
    scriptVal (val) {
      this.form.script = this.handleString(val) ? this.handleString(val) : ''
    },
    handleString (val) {
      let arr = []
      if (val) {
        val.forEach((v) => {
          if (v.value) {
            // let re = /^".*?"$/
            // if (re.test(v.value)) {
            //   arr.push(v.value.substring(1, v.value.length - 1))
            // } else {
            //   arr.push(v.value)
            // }
            // console.log(v.value)
            arr.push(v.value)
            // arr += v.value.substring(1, v.value.length - 1)
          }
        })
        if (arr.length > 0 && arr[0]) {
          // return `${arr.join(',')}`
          return arr
        }
      }
    },
    handleObject (val) {
      /*
      * val:
      * {key:'时间格式',value:'输入的内容'}
      * */
      let obj = {}
      console.log(JSON.stringify(val))
      if (val && val[0].value) {
        val.forEach((v) => {
          console.log(v)
          if (v.value) {
            let value = v.value.replace(/(\s*):(\s*)/g, ':')
            // let value = v.value
            let i = value.indexOf(':')
            let pre = value.substring(0, i)
            let end = value.substring(i + 1)
            obj[pre] = end
          }
        })
        try {
          if (obj) {
            return JSON.stringify(obj)
          } else {
            return ''
          }
        } catch (e) {
          this.$message.error('请检输入的格式是否有问题!')
          console.log(e)
        }
      } else {
        return ''
      }
    },
    objArray (val) { // 返回组件的数据
      /*
      * 这里返回的数据的[{value:''},{value:''},{value:''}]
      * */
      console.log(val)
      if (val && val !== '{}' && JSON.stringify(val) !== '{}') {
        try {
          let obj = JSON.parse(val)
          let arr = []
          for (let key in obj) {
            arr.push({value: `${key}:${obj[key]}`})
          }
          return arr
        } catch (e) {
          console.log(e)
        }
      } else {
        return [{value: ''}]
      }
    },
    strArray (val) { // 返回组件的数据
      if (val) {
        try {
          // let obj = val.substring(1, val.length - 1)
          let obj = val
          let result = obj.map((v) => {
            // return {value: v.substring(1, v.length - 1)}
            return {value: v}
          })
          return result
        } catch (e) {
          console.log(e)
        }
      } else {
        return [{value: ''}]
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
    async handleIdetify () {
      let checksubmit = false
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          console.log(checksubmit)
          if (checksubmit) {
            this.$message.error('请将指纹的基本信息填写完整!')
            return false
          }
          this.showResult = false
          this.form.result_idetify = []
          if (this.Regerr) {
            this.$message.error('请检查输入的内容格式是否正确!')
            return false
          }
          if (!this.form.rec_name || !this.form.address) {
            this.$message.error('请先填写基本信息中的识别名称和探测地址')
            return false
          }
          this.identify_loading = true
          let resultA = await this.$identifyFin(this.form, this.form.address, this.form.rec_name)
          console.log(resultA)
          let resultB = JSON.stringify(resultA)
          let result = JSON.parse(resultB)
          let flag = false
          for (let key in result) {
            result[key].forEach((v, k) => {
              if (v === 'pass') {
                flag = true
                return false
              }
            })
          }
          if (this.activeIndex === 2) {
            this.mySwiper.slideNext()
          }
          if (flag) { // 进行判断是否进行编码赋值处理
            this.$set(this.form, 'result_idetify', result)
            this.$forceUpdate()
            let {headers, html, url, script, meta, js, implies, excludes, CPE} = this.form
            let formIdentify = {headers, html, url, script, meta, js, implies, excludes, CPE}
            this.form.fingerCoding = this.$jsEncrypt(JSON.stringify(formIdentify))
            // console.log(this.$sm2Encrypt(JSON.stringify(formIdentify)))
            // this.writeLog(result)
          } else {
            this.$set(this.form, 'result_idetify', result)
            this.$forceUpdate()
            this.form.fingerCoding = ''
            // this.$message.error('填写的识别规则没有通过,请检查!')
          }
          this.identify_loading = false
          this.showResult = true
          this.getFingerList()
        } else {
          this.$message.error('请将指纹的基本信息填写完整!')
          this.form.fingerCoding = ''
        }
      })
    },
    handleReadFile () {
      return new Promise((resolve, reject) => {
        try {
          fs.readFile(path.join(__static, './wappalyzer/apps.json'), 'utf8',
            function (err, data) {
              if (err) throw err
              resolve(JSON.parse(data))
              // return JSON.parse(data)
            })
        } catch (e) {
          console.log(e)
          reject(e)
        }
      })
    },
    async getFingerList () {
      this.fingerList = []
      let content = await this.handleReadFile()
      let {headers, html, url, script, meta, js} = this.form
      let pollingArr = {headers, html, url, script, meta, js}
      let polling = {}
      for (let vi in pollingArr) {
        if (pollingArr[vi] && pollingArr[vi] !== '{}' && JSON.stringify(pollingArr[vi]) !== '{}') {
          if (vi === 'headers' || vi === 'meta' || vi === 'js') {
            polling[vi] = JSON.parse(pollingArr[vi])
          } else {
            polling[vi] = pollingArr[vi]
          }
        }
      }
      let identifyName = {
        [this.form.rec_name]: {
          ...polling,
          cats: [this.form.dict_id]
        }
      }
      content.apps = {
        ...identifyName,
        ...content.apps
      }
      let response = await checkFP(this.form.address, JSON.stringify(content))
      let resultObj = {}
      try {
        resultObj = JSON.parse(response).data.details
        if (!JSON.parse(response).data.apps) {
          this.$message.error('请检查探测地址是否正确！')
        }
      } catch (e) {
        console.log(e)
      }
      let resultArr = []
      Object.keys(resultObj).forEach((key, index) => {
        resultArr.push({name: key, ...resultObj[key]})
      })
      this.fingerList = [...resultArr]
      console.log(this.fingerList)
      this.$forceUpdate()
    },
    // writeLog (data) {
    //   let logArr = [data.headers, data.html, data.url, data.script, data.meta, data.js]
    //   let logNum = {pass: 0, unpass: 0, none: 0}
    //   var time = new Date().getTime()
    //   for (let val of logArr) {
    //     val === 'none' ? logNum.none += 1 : val === 'pass' ? logNum.pass += 1 : logNum.unpass += 1
    //   }
    //   if (logNum.pass > 0 && logNum.unpass === 0) {
    //     this.form.log_pass_num += 1
    //     this.form.log_pass_info += this.$formatTime(time).dateTime + ' ' + this.form.address + ' ' + '通过' + '\n'
    //   } else if (logNum.pass > 0 && logNum.unpass !== 0) {
    //     this.form.log_unpass_num += 1
    //     this.form.log_unpass_info += this.$formatTime(time).dateTime + ' ' + this.form.address + ' ' + '未通过' +
    //       '\n'
    //   }
    //   this.form.log_ratio = Number(
    //     this.form.log_pass_num / (this.form.log_pass_num + this.form.log_unpass_num).toFixed(2))
    // },
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
    InputAdd
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

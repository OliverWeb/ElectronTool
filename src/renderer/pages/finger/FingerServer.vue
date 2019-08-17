<template>
	<div class="finger_server">
		<breadcrumb @backStep="backStep" @BreadCrumb="BreadCrumb" class="breadTitle"></breadcrumb>
		<div class="container">
			<div class="swiper-container">
				<div class="swiper-wrapper">
					<div class="swiper-slide swiper-no-swiping">
						<h3 class="swiper-title">基本信息</h3>
						<el-form
							class="co_form_width"
							:model="form"
							:rules="rules_basic"
							ref="form"
							label-width="100px"
							size="small"
						>
							<el-form-item label="指纹名称：" prop="name">
								<el-input
									placeholder="西门子PLC SIMATIC S7-1200"
									size="medium"
									v-model="form.name"
								></el-input>
							</el-form-item>
							<el-form-item label="指纹分类：" prop="service_type_dict">
								<el-select
									@change="getSelectItem"
									:popper-append-to-body="false"
									:disabled="disabled"
									placeholder="请选择指纹分类"
									size="medium"
									style="width: 100%"
									clearable
									v-model="form.service_type_dict"
									filterable
								>
									<el-option
										v-for="item in service_type_dict"
										:key="item._id"
										:label="item.chinese"
										:value="item._id"
									></el-option>
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
									:loading="Man_loading"
								>
									<el-option
										v-for="item in VendorOption"
										:key="item._id"
										:label="item.vendor"
										:value="item.vendor"
									></el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="识别名称：" prop="rec_name">
								<el-input
									placeholder="请输入识别名称，如 Siemens Simatic S7-1200 PLC"
									size="medium"
									v-model="form.rec_name"
								></el-input>
							</el-form-item>
							<el-form-item label="指纹简介：" prop="introduction">
								<el-input
									:disabled="disabled"
									type="textarea"
									rows="8"
									placeholder="请输入指纹简介"
									v-model="form.introduction"
								></el-input>
							</el-form-item>
						</el-form>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<h3 class="swiper-title">探测目标</h3>
						<el-form
							class="co_form_width flex_form"
							:model="form"
							:rules="rules_detect"
							ref="form_detect"
							label-width="100px"
							size="small"
						>
							<el-form-item label="探测器：" prop="det_name">
								<!--<el-input placeholder="请选择或新建探测器" v-model="form.det_name"></el-input>-->
								<el-select
									clearable
									:popper-append-to-body="false"
									style="width: 100%"
									size="medium"
									v-model="form.det_name"
									filterable
									default-first-option
									:allow-create="true"
									remote
									placeholder="请输入或选择探测"
									:remote-method="getDetectSelectItem"
									:loading="detect_loading">
									<el-option
										v-for="item in DetectArray"
										:key="item.det_id"
										:label="item.name"
										:value="item.name">
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="基础协议：" prop="protocol">
								<el-radio v-model="form.protocol" label="TCP">TCP</el-radio>
								<el-radio v-model="form.protocol" label="UDP">UDP</el-radio>
							</el-form-item>
							<el-form-item label="探测包：" prop="package">
								<el-input type="textarea" rows="8" placeholder="请输入" v-model="form.package"></el-input>
							</el-form-item>
							<el-form-item label="目标：" prop="host">
								<el-input placeholder="请输入IP地址" v-model.trim="form.host"></el-input>
							</el-form-item>
							<el-form-item label="端口：" prop="port">
								<el-input placeholder="请输入端口" v-model="form.port"></el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button
								class="handle_btn"
								type="info"
								:loading="DetectLoading"
								plain
								@click="handleDetect()"
							>{{DetectLoading?'正在探测':'探测'}}
							</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping" style="display: flex">
						<h3 class="swiper-title">回包信息</h3>
						<high-lighter :result="form.result" :result_16="form.result_16"></high-lighter>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<h3 class="swiper-title">识别规则</h3>
						<el-form
							class="co_form_width flex_form"
							:model="form"
							:rules="rules_idetify"
							ref="form_idetify"
							label-width="100px"
							size="small"
						>
							<el-form-item label="服务：" prop="service">
								<el-input placeholder="请输入服务" size="medium" v-model="form.service"></el-input>
							</el-form-item>
							<el-form-item label="指纹特征：" prop="characteristic">
								<el-input
									type="textarea"
									:autosize="{ minRows: 3, maxRows: 5}"
									placeholder="请输入指纹特征"
									size="medium"
									v-model="form.characteristic"
								></el-input>
							</el-form-item>
							<el-form-item label="版本/型号：" prop="version">
								<el-input placeholder="$1" size="medium" v-model="form.version"></el-input>
							</el-form-item>
							<el-form-item label="额外信息：" prop="extraInfo">
								<el-input
									placeholder="name:$1;cluster:$2;Lucene:$4"
									size="medium"
									v-model="form.extraInfo"
								></el-input>
							</el-form-item>
							<el-form-item label="CPE信息：" prop="CPE">
								<el-input
									type="input"
									:autosize="{ minRows: 6, maxRows: 16}"
									placeholder="cpe:/a:apache:lucene:$4"
									v-model="form.CPE"
								></el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button class="handle_btn" type="info" @click="handleIdetify" plain>识别</el-button>
						</div>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<h3 class="swiper-title">识别结果</h3>
						<el-form class="co_form_width" :model="identifyResult" label-width="100px" size="small">
							<el-form-item label="服务名称：" prop="service">
								<el-input :readonly="true" size="medium" v-model="identifyResult.service"></el-input>
							</el-form-item>
							<el-form-item label="指纹特征：" prop="characteristic">
								<el-input
									:readonly="true"
									type="textarea"
									:autosize="{ minRows: 3, maxRows: 5}"
									size="medium"
									v-model="identifyResult.characteristic"
								></el-input>
							</el-form-item>
							<el-form-item label="版本/型号：" prop="version">
								<el-input :readonly="true" size="medium" v-model="identifyResult.version"></el-input>
							</el-form-item>
							<el-form-item label="额外信息：" prop="extraInfo">
								<el-input :readonly="true" size="medium" v-model="identifyResult.extraInfo"></el-input>
							</el-form-item>
							<el-form-item label="CPE信息：" prop="CPE">
								<el-input :readonly="true" type="input" v-model="identifyResult.CPE"></el-input>
							</el-form-item>
							<!--<el-button class="handle_btn" type="info" @click="handleIdetify" plain>识别</el-button>-->
						</el-form>
					</div>
					<div class="swiper-slide swiper-no-swiping">
						<h3 class="swiper-title">指纹编码</h3>
						<el-form class="co_form_width flex_form" :model="form" ref="code_form">
							<el-form-item prop="fingerCoding" label>
								<el-input
									ref="fingerCoding"
									class="dash_textarea textarea_read"
									:readonly="true"
									type="textarea"
									:rows="18"
									v-model="form.fingerCoding"
								></el-input>
							</el-form-item>
						</el-form>
						<div style="height:38px">
							<el-button
								class="handle_btn"
								type="info"
								plain
								@click="handleCopy(form.fingerCoding)"
							>复制
							</el-button>
						</div>
					</div>
				</div>
				<!-- Add Pagination -->
				<div class="swiper-pagination"></div>
				
				<!--	<div class="swiper-button-next"></div>
				<div class="swiper-button-prev"></div>-->
			</div>
		</div>
		<!-- 上下页 -->
		<i
			class="el-icon-arrow-left arrow left_arrow"
			@click="goNext('prev')"
			:class="{unactived:activeIndex===0}"
		></i>
		<i
			class="el-icon-arrow-right arrow right_arrow"
			@click="goNext('next')"
			:class="{unactived:activeIndex===4}"
		></i>
		<!-- <i class="iconfont icon-left  arrow left_arrow" @click="goNext('prev')" v-if="activeIndex!=0"></i>
		<i class="iconfont icon-right  arrow right_arrow"   @click="goNext('next')" v-if="activeIndex!=4"></i>-->
	</div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import Swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'
import md5 from 'blueimp-md5'
import HighLighter from '@/components/Highlighter'

export default {
  data () {
    return {
      form: {
        type: 'service',
        name: '',
        service_type_dict: '', // 指纹分类
        manufacturer: '', // 厂商
        rec_name: '', // 识别名称
        introduction: '', // 指纹简介
        det_name: '', // 探测器
        protocol: 'TCP', // 协议
        package: '', // 探测包
        host: '',
        port: '',
        result: '', // 回包
        result_16: '', // 十六进制回包
        service: '', // 服务
        characteristic: '', // 指纹特征
        version: '', // 版本
        extraInfo: '', // 额外信息,
        CPE: '',
        fingerCoding: '', // 指纹编码
        log_pass_num: 0,
        log_unpass_num: 0,
        log_pass_info: '',
        log_unpass_info: '',
        log_ratio: 0,
        address: '',
        dict_cn: ''
      },
      initform: {
        type: 'service',
        name: '',
        service_type_dict: '', // 指纹分类
        manufacturer: '', // 厂商
        rec_name: '', // 识别名称
        introduction: '', // 指纹简介
        det_name: '', // 探测器
        protocol: 'TCP', // 协议
        package: '', // 探测包
        host: '',
        port: '',
        result: '', // 回包
        result_16: '', // 十六进制回包
        service: '', // 服务
        characteristic: '', // 指纹特征
        version: '', // 版本
        extraInfo: '', // 额外信息,
        CPE: '',
        fingerCoding: '', // 指纹编码
        log_pass_num: 0,
        log_unpass_num: 0,
        log_pass_info: '',
        log_unpass_info: '',
        log_ratio: 0,
        address: '',
        dict_cn: ''
      },
      identifyResult: {
        // 识别结果
        service: '', // 服务
        characteristic: '', // 指纹特征
        version: '', // 版本
        extraInfo: '', // 额外信息,
        CPE: ''
      },
      sourceHtml: '', // html源码
      rules_basic: {
        // 基本信息
        name: [
          {required: true, message: '请输入指纹名称', trigger: 'blur'}, {
            validator: async (rule, value, callback) => {
              if (!value) {
                callback()
                // } else if (/^[A-Za-z0-9_\u4E00-\u9FA5\s.-]+$/.test(value)) {
              } else if (value) {
                let res = await this.$findOne({name: value})
                console.log(res)
                if (res && this.form.name !== this.old_form.name) {
                  callback(new Error('名称已存在'))
                } else {
                  callback()
                }
              } else {
                callback(new Error('请输入指纹名称'))
              }
            }
          }],
        service_type_dict: [
          {required: true, message: '请选择指纹分类', trigger: 'change'}
        ],
        manufacturer: [
          {required: true, message: '请选择厂商', trigger: 'change'}
        ],
        rec_name: [
          {required: true, message: '请输入识别名称', trigger: 'blur'}, {
            validator: async (rule, value, callback) => {
              if (/[\u4E00-\u9FA5]/g.test(value)) {
                callback(new Error('识别名称只能是字母、数字、下划线,不能为中文'))
                // } else if (/^[A-Za-z0-9-_\s.]+$/.test(value)) {
              } else if (value) {
                let res = await this.$findOne({rec_name: value})
                if (res && this.form.rec_name !== this.old_form.rec_name) {
                  callback(new Error('名称已存在'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }
          }
        ],
        introduction: [
          {required: true, message: '请输入指纹简介', trigger: 'blur'}
        ]
      },
      rules_detect: {
        // 探测目标
        det_name: [
          {required: true, message: '请输入探测器', trigger: 'change'}, {
            validator: (rule, value, callback) => {
              if (/[\u4E00-\u9FA5]/g.test(value)) {
                callback(new Error('探测器名称不能为中文!'))
              } else {
                callback()
              }
            }
          }
        ],
        protocol: [{required: true, trigger: 'change'}],
        host: [{required: true, message: '请输入IP', trigger: 'blur'}],
        port: [{required: true, message: '请输入端口', trigger: 'blur'}]
      },
      rules_idetify: {
        service: [
          {required: true, message: '请输入服务', trigger: 'blur'}, {
            validator: (rule, value, callback) => {
              if (/[\u4E00-\u9FA5]/g.test(value)) {
                callback(new Error('服务名称不能为中文!'))
              } else {
                callback()
              }
            }
          }],
        characteristic: [
          {required: true, message: '请输入指纹特征', trigger: 'blur'}
        ],
        version: [
          {trigger: 'blur'}, {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
              } else if (/^\$[0-9]$/.test(value)) {
                callback()
              } else {
                callback(new Error('请检查填写正则,$1'))
              }
            }
          }
        ],
        extraInfo: [
          {trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
              } else if (/(\w:\$\d;?$)+/.test(value)) {
                callback()
              } else {
                callback(new Error('请检查填写正则,name:$1;cluster:$2;Lucene:$4'))
              }
            }
          }
        ], // 额外信息,
        CPE: [
          {trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
              } else if (/.+:\$\d$/.test(value)) {
                callback()
              } else {
                callback(new Error('请检查填写正则,cpe:/a:apache:lucene:$4'))
              }
            }
          }
        ]
      },
      disabled: false,
      mySwiper: '', // 轮播声明
      activeIndex: 0,
      DetectLoading: false,
      service_type_dict: require('../../../../static/json/service_fin_dict.json')
        .RECORDS, // 服务指纹分类
      Man_loading: false,
      VendorOption: [],
      service_loading: false,
      ServiceOption: [],
      isSave: false,
      handleBack: false,
      DetectList: [],
      DetectArray: [],
      detect_loading: false,
      old_form: ''
    }
  },
  beforeRouteLeave (to, from, next) {
    if (md5(JSON.stringify(this.initform)) === md5(JSON.stringify(this.form)) && !this.form._id) {
      next()
    } else if (md5(JSON.stringify(this.old_form)) === md5(JSON.stringify(this.form))) {
      next()
    } else if (!this.isSave && !this.handleBack) {
      this.$confirm(
        '检测到未保存的内容，是否在离开页面前保存修改？',
        '确认信息',
        {
          distinguishCancelAndClose: true,
          confirmButtonText: '保存',
          cancelButtonText: '放弃修改'
        }
      )
        .then(() => {
          this.handleSave(true) // 保存离开
          // this.$router.go(-1)
          this.$message({
            type: 'info',
            message: '已保存修改'
          })
          next()
        })
        .catch(action => {
          if (action === 'cancel') {
            // this.$router.go(-1)
            next()
          }
        })
    } else {
      next()
    }
  },
  watch: {
    'form.det_name' (val) {
      console.log(val)
      if (val) {
        let slectItem = this.DetectList.filter(item => item.name === val)[0]
        if (slectItem) {
          this.form.protocol = slectItem.protocol
          this.form.package = slectItem.package
        }
      }
    }
  },
  mounted () {
    /*
     * 滚动组件swiper
     * */
    this.mySwiper = new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      slidesPerView: 2,
      paginationClickable: true,
      // nextButton: '.swiper-button-next',
      // prevButton: '.swiper-button-prev'
      spaceBetween: 30,
      noSwiping: true,
      keyboardControl: true,
      onSlideChangeEnd: swiper => {
        this.activeIndex = swiper.activeIndex
      }
    })
    /*
     * 点击进行copy
     * */
    /* this.$refs.backInfo_16.$el.onclick = () => {
      this.handleCopy(this.form.result_16)
    }
    this.$refs.backInfo.$el.onclick = () => {
      this.handleCopy(this.form.result)
    }
    this.$refs.fingerCoding.$el.onclick = () => {
      this.handleCopy(this.form.fingerCoding)
    } */
    this.getDetail()
    this.getDetactList()
  },
  methods: {
    getDetactList () {
      let params = {
        page_num: 0,
        page_size: 1000,
        search_param: ''
      }
      this.$post('/detector?act=detector_manage_handler', params)
        .then(res => {
          console.log(res)
          this.DetectList = res.data
        })
    },
    getSelectItem (value) {
      let choosenItem = this.service_type_dict.filter(item => item._id === value)[0]
      if (choosenItem) {
        this.form.dict_cn = choosenItem.chinese
      } else {
        this.form.dict_cn = ''
      }
    },
    getDetectSelectItem (query) {
      if (query !== '') {
        this.detect_loading = true
        setTimeout(() => {
          this.detect_loading = false
          this.DetectArray = this.DetectList.filter(item => {
            return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.DetectArray = this.DetectList
        //  待定
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
      if (this.$route.query._id) {
        let _id = this.$route.query._id
        this.$search({_id: _id}).then(res => {
          this.old_form = {...res.data[0]}
          this.form = res.data[0]
          this.identifyResult = this.form.identifyResult
          this.form.result_16 = this.stringToHex(this.form.result)
        })
      }
    },
    handleSave (cancel) {
      console.log(this.form)
      let flag = true
      this.$refs['form'].validateField('name', (valid) => {
        flag = !valid
      })
      if (flag) {
        let saveForm = {
          ...this.form,
          identifyResult: {...this.identifyResult},
          address: `http://${this.form.host}:${this.form.port}`
        }
        console.log(this.identifyResult)
        console.log(saveForm)
        this.$save(saveForm).then((res) => {
          console.log(res)
          this.isSave = true
          this.form = {...res} // 保存成功后进行赋值
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
    hexToString (str) {
      let val = ''
      let arr = str.split(',')
      for (var i = 0; i < arr.length; i++) {
        val += String.fromCharCode(parseInt(arr[i], 16))
      }
      return val
    },
    stringToHex (str) {
      var val = ''
      for (var i = 0; i < str.length; i++) {
        if (val === '') {
          let code = str.charCodeAt(i).toString(16)
          if (code.length === 4) {
            code = this.$toUTF8Hex(this.$evil(`"\\u${str.charCodeAt(i).toString(16)}"`))
          }
          val = code + '-' // 获取字符的Unicode码然后转16进制
        } else {
          if (i !== str.length - 1) {
            if (str.charCodeAt(i).toString(16).length === 1) {
              let code = str.charCodeAt(i).toString(16)
              if (code.length === 4) {
                code = this.$toUTF8Hex(this.$evil(`"\\u${str.charCodeAt(i).toString(16)}"`))
              }
              val += '0' + code + '-'
            } else {
              let code = str.charCodeAt(i).toString(16)
              if (code.length === 4) {
                code = this.$toUTF8Hex(this.$evil(`"\\u${str.charCodeAt(i).toString(16)}"`))
              }
              val += code + '-'
            }
          } else {
            let code = str.charCodeAt(i).toString(16)
            if (code.length === 4) {
              code = this.$toUTF8Hex(this.$evil(`"\\u${str.charCodeAt(i).toString(16)}"`))
            }
            val += code
          }
        }
      }
      return val
    },
    validResult (form) {
      return new Promise((resolve, reject) => {
        this.$refs[form].validate(valid => {
          resolve(valid)
        })
      })
    },
    getExp (str) {
      let arr = str.split(';')
      let obj = {}
      arr.forEach((value, index) => {
        let twoArr = value.split(':')
        obj[twoArr[0]] = twoArr[1]
      })
      Object.keys(obj).forEach((key, index) => {
        obj[key] = RegExp[obj[key]]
      })
      let resultStr = ''
      Object.keys(obj).forEach((key, index) => {
        resultStr += `${key}:${obj[key]}${
          index !== Object.keys(obj).length - 1 ? ';' : ''
        }`
      })
      return resultStr
    },
    async handleDetect () {
      /*
      * 1.探测通过了,没有返回任何消息
      * */
      this.form.result = ''
      this.form.result_16 = ''
      // let formBasic = await this.validResult('form_basic')
      let formDetect = await this.validResult('form_detect')
      if (formDetect) {
        this.DetectLoading = true
        let params = {
          host: this.form.host,
          port: this.form.port
        }
        try {
          params.package = this.$evil(`"${this.form.package}"`)
        } catch (e) {
          this.DetectLoading = false
          this.$message.error('请检查探测包的输入的格式是否正确!')
          console.log(e)
          return false
        }
        if (this.form.protocol === 'TCP') {
          await this.$tcp(params)
            .then(res => {
              console.log(res)
              if (res.connect && res.timeout) {
                this.DetectLoading = false
                this.$message.error('目标已连接,回包信息未返回!')
              } else if (res.data) {
                this.$message.success('探测成功')
                this.DetectLoading = false
                if (this.activeIndex === 0) {
                  this.mySwiper.slideNext()
                }
                this.form.result = res.data.toString()
                console.log(this.form.result)
                this.form.result_16 = this.stringToHex(this.form.result)
                // this.form.result_16 = this.$toUTF8Hex(this.form.result)
                // this.$store.dispatch('updateFinger', this.form)
              } else if (res.connect && !res.data) {
                this.form.result = ''
                this.form.result_16 = ''
                this.DetectLoading = false
                this.$message({
                  message: '回包信息为空',
                  type: 'warning'
                })
              } else if (res.timeout) {
                this.$message.error('探测超时!')
                this.DetectLoading = false
              }
            })
            .catch(err => {
              console.log(err)
              this.DetectLoading = false
              this.$message.error('探测失败,请检查目标和端口!')
              // this.form.result = err.toString()
            })
        } else {
          await this.$udp(params)
            .then(res => {
              console.log(res)
              if (res.send && res.timeout) {
                this.$message.error('数据已发送,回包信息未返回!')
                this.DetectLoading = false
              } else if (res.data) {
                this.$message.success('探测成功')
                this.mySwiper.slideNext()
                this.DetectLoading = false
                this.form.result = res.data.toString()
                this.form.result_16 = this.stringToHex(this.form.result)
              } else if (res.connect && !res.data) {
                this.$message({
                  message: '回包信息为空',
                  type: 'warning'
                })
                this.DetectLoading = false
              } else if (res.timeout) {
                this.$message.error('探测超时!')
                this.DetectLoading = false
              }
            })
            .catch(err => {
              console.log(err)
              this.DetectLoading = false
              this.$message.error('请检查探测目标和端口')
            })
        }
      }
    },
    async handleIdetify () {
      let _this = this
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.form.fingerCoding = ''
          if (!this.form.result && !this.form.result_16) {
            this.$message({
              showClose: true,
              message: '没有回包信息,请先进行指纹探测',
              type: 'warning'
            })
            this.mySwiper.slidePrev()
            this.mySwiper.slidePrev()
            return
          }
          let flag1 = true
          let flag2 = true
          this.$refs['form_idetify'].validateField('service', (valid) => {
            flag1 = !valid
          })
          this.$refs['form_idetify'].validateField('characteristic', (valid) => {
            flag2 = !valid
          })
          if (flag1 && flag2) {
            let regUtf = this.form.characteristic.replace(/(\\x[0-9a-f]{2})*/g, function () {
              console.log(arguments[0])
              let codeUtf8 = arguments[0].replace(/\\x/g, '')
              console.log(codeUtf8)
              let codeHex = _this.$utf8HexToStr(codeUtf8)
              return codeHex
            })
            console.log(regUtf)
            console.log(regUtf.length)
            let patternCha = this.$evil(`/${regUtf}/i`) // 特征
            console.log(patternCha)
            this.identifyResult.service = this.form.service
            if (patternCha.test(this.form.result)) {
              // 进入特征匹配
              if (this.activeIndex === 2) {
                // 匹配成功移动下一页
                this.mySwiper.slideNext()
              }
              this.identifyResult.characteristic = this.form.result.match(patternCha)[0] // 指纹特征
              this.identifyResult.extraInfo =
                this.form.extraInfo === '' ? '' : this.getExp(this.form.extraInfo) // 额外信息 end
              this.identifyResult.version = RegExp[this.form.version] ? RegExp[this.form.version] : ''// 版本 end
              var CPEArr = this.form.CPE.split(':$')
              if (CPEArr.length > 1) {
                let cpe = RegExp[`$${CPEArr[1]}`]
                this.identifyResult.CPE = (this.form.CPE === '' ? '' : CPEArr[0] + `:${cpe}`)// 额外信息 end
              } else {
                this.identifyResult.CPE = ''
              }
              let {service, characteristic, version, extraInfo, CPE} = this.form
              let identifyRules = {service, characteristic, version, extraInfo, CPE}
              this.form.fingerCoding = this.$jsEncrypt(JSON.stringify(identifyRules))
            } else {
              this.identifyResult.characteristic = ''
              this.identifyResult.version = ''
              this.identifyResult.extraInfo = ''
              this.identifyResult.CPE = ''
              this.$message.error('匹配失败')
              this.form.fingerCoding = ''
            }
          }
        } else {
          this.$message.error('请将指纹的基本信息填写完整')
        }
      })
    },
    // 写入日志
    writeLog (data) {
      let logArr = [
        data.characteristic,
        data.version,
        data.extraInfo,
        data.CPE
      ]
      let logNum = {pass: 0, unpass: 0, none: 0}
      var time = new Date().getTime()
      for (let val of logArr) {
        val === 'none'
          ? (logNum.none += 1)
          : val === 'pass'
            ? (logNum.pass += 1)
            : (logNum.unpass += 1)
      }
      if (logNum.pass > 0 && logNum.unpass === 0) {
        this.form.log_pass_num += 1
        this.form.log_pass_info +=
          this.$formatTime(time).dateTime +
          ' ' +
          this.form.host +
          ' ' +
          this.form.port +
          ' ' +
          '通过' +
          '\n'
      } else if (logNum.pass > 0 && logNum.unpass !== 0) {
        this.form.log_unpass_num += 1
        this.form.log_unpass_info +=
          this.$formatTime(time).dateTime +
          ' ' +
          this.form.host +
          ' ' +
          this.form.port +
          ' ' +
          '未通过' +
          '\n'
      }
      this.form.log_ratio = Number(
        this.form.log_pass_num /
        (this.form.log_pass_num + this.form.log_unpass_num).toFixed(2)
      )
    },
    handleCopy (text) {
      if (!text) return
      this.$copyText(text).then(
        e => {
          this.$message.success('复制成功')
        },
        e => {
          console.log(e)
        }
      )
    },
    /* 处理厂商 */
    getVendorOption (query) {
      if (query !== '') {
        this.Man_loading = true
        setTimeout(() => {
          this.Man_loading = false
          this.$vendorSearch(query).then(res => {
            this.VendorOption = res.data
          })
        }, 200)
      } else {
        this.VendorOption = []
        //  待定
      }
    },
    /* 服务文 */
    getServiceOption (query) {
      if (query !== '') {
        this.service_loading = true
        setTimeout(() => {
          this.service_loading = false
          this.$serviecSearch(query).then(res => {
            this.ServiceOption = res.data
          })
        }, 200)
      } else {
        this.ServiceOption = []
        //  待定
      }
    },
    BreadCrumb (val) {
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
    HighLighter
  }
}
</script>

<style lang="less">
	@import "../../../renderer/assets/style/flex.less";
	
	.finger_server {
		// 	.textarea_read {
		// 		& > textarea {
		// 			/*background: #fff !important;*/
		// 			/*cursor: copy !important;*/
		// 		}
		// 	}
		
		.swiper-title {
			margin-bottom: 16px;
			font-size: 16px;
		}
		
		.handle_btn {
			width: 100%;
			border: 0;
		}
		
		.dash_textarea {
			textarea {
				border: 2px dashed #d4dae2;
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
			border: 1px solid #e6eaee;
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
	}
</style>

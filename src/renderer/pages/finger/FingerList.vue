<template>
	<div class="sub_page">
		<div class="page_title">
			<el-input
				size="medium"
				type="text"
				style="width:500px;"
				placeholder="搜索指纹"
				clearable
				v-model="name"
			></el-input>
			<span>编辑模式</span>
			<el-switch v-model="edit" active-color="#52c41a" inactive-color="#bfbfbf"></el-switch>
			<!--<span style="margin-left: 20px">多选</span>-->
			<!--<el-switch v-model="Checkbox" active-color="#52c41a" inactive-color="#bfbfbf"></el-switch>-->
			<el-button :loading="downloading" @click="handleDownload('all')" style="margin-left: 20px;" size="mini"
								 class="export_btn">全部导出
			</el-button>
			<div style="display: inline-block;vertical-align: middle;height: 28px;margin-top: -2px">
				<upload-json :uploadLoading="uploadLoading" ref="upload" @SendFile="ReceiveFile"></upload-json>
			</div>
		</div>
		<el-row :gutter="30" class="local_finger">
			<el-col :span="15">
				<div class="grid-content">
					<div class="left_title">
						<p style="display: inline-block">本地指纹</p>
					</div>
					<el-table highlight-current-row :data="tableData" @row-click="selectActive" ref="singleTable" height="500">
						<el-table-column width="50">
							<template slot-scope="scope">
                <span
									class="circle"
									:class="{active:!!checkArr[scope.$index]}"
								>
                  <i class="el-icon-check" v-if="!!checkArr[scope.$index]"></i>
                </span>
							</template>
						</el-table-column>
						<el-table-column class-name="name" prop="name" show-overflow-tooltip>
						</el-table-column>
						<el-table-column width="90" class-name="left_type">
							<template slot-scope="scope">{{scope.row.type==='web'?'Web指纹':'服务指纹'}}</template>
						</el-table-column>
						<el-table-column width="60" v-if="!edit">
							<template slot-scope="scope">
								<el-dropdown class="more" @command="handleCommand" trigger="click">
                  <span>
                    <i class="el-icon-more"></i>
                  </span>
									<el-dropdown-menu slot="dropdown">
										<el-dropdown-item :command="{type:'edit',data:scope.row}">
											<el-button type="text" size="mini">查看/编辑</el-button>
										</el-dropdown-item>
										<el-dropdown-item :command="{type:'download'}">
											<el-button type="text" size="mini">导出</el-button>
										</el-dropdown-item>
										<el-dropdown-item :command="{type:'del',data:scope.row._id}">
											<el-button type="text" size="mini">删除</el-button>
										</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
								<!-- <span
									v-else
									:class="{grey:scope.row.log_ratio<0.5, green:scope.row.log_ratio>=0.5}"
								>{{scope.row.log_ratio?scope.row.log_ratio*100:0}}%</span> -->
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :span="9" v-if="tableData.length!==0">
				<div class="grid-content">
					<!-- <div class="right_top" v-if="!edit">
						<p class="title">{{activeData.name}}</p>
						<el-row class="content">
							<el-col :span="12" class="box">
								<el-progress
									type="circle"
									:percentage="activeData.log_ratio*100"
									:stroke-width="4"
									:show-text="false"
									:width="86"
									color="#0064FF"
									class="progress"
								></el-progress>
							</el-col>
							<el-col :span="12" class="box">
								<div class="text is_ok">
									<p>
										<span>验证通过</span>
										<el-popover placement="right" width="400" trigger="click">
											<div v-html="activeData.log_pass_info?activeData.log_pass_info.split('\n').join('<br/>'):'无'" class="log"></div>
											<el-button slot="reference" type="text">日志</el-button>
										</el-popover>
									</p>
									<span>{{activeData.log_pass_num}} ({{activeData.log_ratio*100}}%)</span>
								</div>
								<div class="text not_ok">
									<p>
										<span>验证未通过</span>
										<el-popover placement="right" width="400" trigger="click">
											<div v-html="activeData.log_unpass_info?activeData.log_unpass_info.split('\n').join('<br/>'):'无'" class="log"></div>
											<el-button slot="reference" type="text">日志</el-button>
										</el-popover>
									</p>
									<span>{{activeData.log_unpass_num}} ({{activeData.log_ratio===0?0:(1-activeData.log_ratio)*100}}%)</span>
								</div>
							</el-col>
						</el-row>
					</div> -->
					<div class="right_bottom" v-if="activeData.type==='web'&&!edit">
						<p class="title">验证</p>
						<el-form ref="form" :model="form" :rules="rules" size="small" label-width="60px" @submit.native.prevent>
							<el-form-item label="目标" prop="url">
								<el-input v-model="form.url" placeholder="请输入 http://URL 或 http://IP:端口"></el-input>
							</el-form-item>
							<el-button class="six_btn" :loading="web_loading" @click="checkWeb">验 证</el-button>
						</el-form>
						<div style="display: flex;" v-for="(vals, key) in webCheck" :key="key" v-if="showWebRes">
							<div style="width: 80px;" class="check_name">{{key}}</div>
							<div>
								<div v-for="(val,i) in vals" :key="i">
									<div style="height: 30px;line-height: 30px"
											 :class="{grey:val==='none', green:val==='pass', red:val==='unpass'}"
									>{{val==='none'?'无':val==='pass'?'通过':val==='unpass'?'未通过':''}}
									</div>
								</div>
							</div>
						</div>
						<el-button class="six_btn" @click="dialogTableVisible = true" v-if="showWebRes">查看指纹详情</el-button>
					</div>
					<div class="right_bottom" v-if="activeData.type==='service'&&!edit">
						<p class="title">验证</p>
						<el-form
							ref="form_server"
							:model="form_server"
							:rules="rules"
							size="small"
							label-width="60px"
						>
							<el-form-item label="目标" prop="ip">
								<el-input v-model="form_server.ip" placeholder="请输入IP地址"></el-input>
							</el-form-item>
							<el-form-item label="端口" prop="port">
								<el-input v-model="form_server.port" placeholder="请输入端口号"></el-input>
							</el-form-item>
							<el-button class="six_btn" :loading="server_loading" @click="checkServer">验 证</el-button>
						</el-form>
						<p v-for="val in serverCheck" :key="val.name" v-if="showSerRes">
							<span class="check_name">{{val.name}}</span>
							<span
								:class="{grey:val.info==='none', green:val.info==='pass', red:val.info==='unpass'}"
							>{{val.info==='none'?'无':val.info==='pass'?'通过':val.info==='unpass'?'未通过':''}}</span>
						</p>
					</div>
					<div class="right_bottom" v-if="edit">
						<p class="title">概览</p>
						<el-form
							:model="form"
							size="mini"
							label-width="80px"
							label-position="left"
							class="edit_form mb20"
						>
							<el-form-item label="指纹名称">{{activeData.name}}</el-form-item>
							<el-form-item label="指纹分类">
								{{activeData.dict_cn}}
								<!-- <span v-if="activeData.type==='web'">{{activeData.dict_cn}}</span>
								<span v-else>{{activeData.dict_cn}}</span> -->
							</el-form-item>
							<el-form-item label="厂商">{{activeData.manufacturer}}</el-form-item>
							<el-form-item label="识别名称">{{activeData.rec_name}}</el-form-item>
							<el-form-item label="指纹简介">
								<el-popover width="440" trigger="manual" :content="activeData.introduction" v-model="moreDir">
									<span class="introduction" slot="reference" @click="showMoreDir(activeData.introduction)">{{activeData.introduction}}</span>
								</el-popover>
							</el-form-item>
						</el-form>
						<el-button class="six_btn" :loading="checkLoading" @click="uploadToSix(activeData,'submitted')">发布到审核
						</el-button>
						<el-button class="six_btn" :loading="draftLoading" @click="uploadToSix(activeData,'draft')">发布到草稿
						</el-button>
						<el-button class="six_btn" @click="handleEdit(activeData)">查看/编辑</el-button>
						<el-button class="six_btn" @click="handleDownload()">导出</el-button>
						<el-button class="six_btn" @click="removeData(activeData._id)">删 除</el-button>
					</div>
				</div>
			</el-col>
		</el-row>
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
import checkFP from '../../../../static/wappalyzer/server'
import UploadJson from '@/components/UploadJSON'
import { Base64 } from 'js-base64'

let fs = require('fs')
let path = require('path')
export default {
  data () {
    return {
      uploadLoading: false,
      downloading: false,
      gridData: [], // 上传文件和本地有冲突
      checkLoading: false,
      draftLoading: false,
      Checkbox: false,
      checkArr: [true],
      breadTitle: {
        url: ['资产指纹', '管理本地指纹'],
        title: '',
        path: '/index/finger'
      },
      tableData: [],
      name: '',
      show: false,
      edit: false,
      moreDir: false,
      activeData: '',
      form: {url: ''},
      form_server: {
        ip: '',
        port: ''
      },
      webCheck: {
        'headers': '',
        'html': '',
        'url': '',
        'script': '',
        'meta': '',
        'js': ''
      },
      showWebRes: false,
      showSerRes: false,
      serverCheck: [
        {name: '指纹特征', info: ''},
        {name: '版本/型号', info: ''},
        {name: '额外信息', info: ''},
        {name: 'CPE信息', info: ''}
      ],
      rules: {
        ip: [{required: true, message: '请输入IP地址', trigger: 'blur'}],
        port: [{required: true, message: '请输入端口号', trigger: 'blur'}],
        url: [{required: true, message: '请输入地址', trigger: 'blur'}]
      },
      server_loading: false, // 按钮加载
      web_loading: false,
      fingerList: [], // 指纹列表
      dialogTableVisible: false // 查看指纹详情
    }
  },
  watch: {
    Checkbox (val) {
      this.checkArr = [true]
      console.log(this.tableData[0])
      this.$refs.singleTable.setCurrentRow(this.tableData[0])
    },
    name (val, old) {
      if (val !== old) {
        this.getTabelData()
      }
    },
    activeData () { // 切换左侧恢复数据
      this.webCheck = {
        'headers': '',
        'html': '',
        'url': '',
        'script': '',
        'meta': '',
        'js': ''
      }
      this.showWebRes = false
      this.showSerRes = false
      this.serverCheck = [
        {name: '指纹特征', info: ''},
        {name: '版本/型号', info: ''},
        {name: '额外信息', info: ''},
        {name: 'CPE信息', info: ''}
      ]
    }
  },
  async mounted () {
    this.getTabelData()
    // let a = this.$testEncrypt('')
    // console.log(a)
    // console.log(this.$testDecrypt(a))
  },
  methods: {
    async ReceiveFile (val) {
      this.uploadLoading = true
      await this.$sleep(1000)
      this.gridData = []
      console.log('加载了' + this.uploadLoading)
      let _this = this
      console.log(val)
      this.readBlobAsDataURL(val, function (res) {
        console.log(res)
        // let base64Str = res.substring('data:application/x-zip-compressed;base64,'.length)
        let base64Str = res.match(/[^,],(.+)/)[1]
        let base64ToStr = Base64.decode(base64Str)
        console.log(base64ToStr)
        let str = _this.$FileDecrypt(base64ToStr)
        // let str = base64ToStr
        console.log(str)
        try {
          let resArr = JSON.parse(str).RECORDS
          console.log(resArr)
          _this.checkLoacl(resArr)
        } catch (e) {
          this.$message.error('导入失败!')
          this.uploadLoading = false
          console.log(e)
        }
      })
    },
    async checkLoacl (arr) {
      for (let i in arr) {
        let res = await this.$findOne({_id: arr[i]._id})
        console.log(res)
        if (res) { // 进行修改数据
          console.log('进行修改的本地数据')
          this.gridData.push(res)
        } else {
          console.log('进行插入数据')
          let saveInfo = await this.$saveJson(arr[i])
          console.log(saveInfo)
          // this.$message({type: 'success', message: '导入成功!'})
        }
      }
      if (this.gridData.length > 0) {
        this.uploadLoading = false
        this.$confirm(`导入指纹有${this.gridData.length}条本地重复,需要覆盖吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          this.$message({
            type: 'success',
            message: '导入成功!'
          })
          for (var i in this.gridData) {
            await this.$updateJson(this.gridData[i])
          }
          this.getTabelData()
        }).catch(() => {
        })
      } else {
        this.getTabelData()
        this.$message({type: 'success', message: '导入成功!'})
        this.uploadLoading = false
      }
    },
    readBlobAsDataURL (blob, callback) {
      var a = new FileReader()
      a.onload = function (e) { callback(e.target.result) }
      a.readAsDataURL(blob)
    },
    str2ab (str) {
      return new Promise((resolve, reject) => {
        var b = new Blob([str], {type: 'application/octet-stream'})
        resolve(b)
      })
    },
    downFile (blob, fileName) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName)
      } else {
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
    async handleDownload (type) {
      this.downloading = true
      let _this = this
      let data = []
      if (type === 'all') {
        let res = await this.$search({name: ''})
        data = res.data
        console.log(data)
      } else {
        data = [this.activeData]
      }
      if (data && data.length > 0) {
        console.log(JSON.stringify({'RECORDS': data}))
        let jsonData = JSON.stringify({'RECORDS': data})
        let result = await this.str2ab(_this.$FileEncrypt(jsonData)) // 加密后的字符串进行的编码
        console.log(result)
        this.downloading = false
        this.downFile(result, 'finger.zip')
      } else {
        this.downloading = false
        this.$message.error('本地列表为空!')
      }
    },
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
      if (row.row.name === this.activeData.rec_name) {
        return 'success-row'
      }
      return ''
    },
    // 查看更多简介
    showMoreDir (val) {
      if (val.length > 90 && !this.moreDir) {
        this.moreDir = true
      } else if (this.moreDir) {
        this.moreDir = false
      }
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
    async getFingerList (form) {
      let content = await this.handleReadFile()
      let {headers, html, url, script, meta, js} = form
      let pollingArr = {headers, html, url, script, meta, js}
      let polling = {}
      console.log(pollingArr)
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
        [form.rec_name]: {
          ...polling,
          cats: [form.dict_id]
        }
      }
      content.apps = {
        ...identifyName,
        ...content.apps
      }
      console.log(content)
      let response = await checkFP(form.address, JSON.stringify(content))
      let resultObj = {}
      try {
        resultObj = JSON.parse(response).data.details
      } catch (e) {
        console.log(e)
      }
      let resultArr = []
      Object.keys(resultObj).forEach((key, index) => {
        resultArr.push({name: key, ...resultObj[key]})
      })
      this.fingerList = resultArr
    },
    handleCommand (command) {
      if (command.type === 'edit') {
        this.handleEdit(command.data)
      } else if (command.type === 'del') {
        this.removeData(command.data)
      } else if (command.type === 'download') {
        this.handleDownload()
      }
    },
    handleEdit (row) {
      if (row.type === 'web') {
        this.$router.push({name: 'FingerWeb', query: {_id: row._id}})
      } else if (row.type === 'service') {
        this.$router.push({name: 'FingerServer', query: {_id: row._id}})
      }
    },
    getTabelData () {
      this.$search({
        name: this.name
      })
        .then(res => {
          // console.log(res.data)
          if (res.data && res.data.length > 0) {
            this.tableData = res.data
            this.activeData = {...res.data[0]}
            this.checkArr = [true]
            console.log(this.activeData)
          } else {
            this.tableData = []
            this.activeData = null
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    selectActive (row) {
      console.log(row)
      if (this.Checkbox) {
        this.activeData = row
        let index = this.tableData.indexOf(row)
        this.$set(this.checkArr, index, !this.checkArr[index])
        console.log(this.checkArr)
      } else {
        this.activeData = row
        let index = this.tableData.indexOf(row)
        for (let i in this.tableData) {
          this.$set(this.checkArr, i, false)
        }
        this.$set(this.checkArr, index, !this.checkArr[index])
        if (!this.edit) {
          this.$nextTick()
            .then(() => {
              if (row.type === 'web') {
                this.$refs.form.resetFields()
              } else {
                this.$refs.form_server.resetFields()
              }
            })
        }
      }
    },
    removeData (_id) {
      this.$confirm('此操作将永久删除数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$remove({_id: _id})
          .then(res => {
            this.getTabelData()
          })
          .catch(err => {
            console.log(err)
          })
      }).catch(() => {
      })
    },
    // async uploadToSix (data, type) {
    //   for (let i = 0; i < 1000; i++) {
    //     let txt = await this.uploadToSix1(data, type)
    //     if (txt.errmsg !== '该指纹名称已上传至六耳') {
    //       console.log('%c友情提示======>>>>>>>出错了', 'color:red')
    //     } else {
    //       console.log(`测试次数===>>>>>${i}`)
    //     }
    //   }
    //   console.log('%c友情提示======>>>>>>检测完成', 'color:red')
    // },
    async uploadToSix (data, type) {
      if (!this.$store.state.isOnline) {
        this.$message.error('当前为离线状态,不能发布')
        return false
      }
      if (data.fingerCoding) {
        if (type === 'submitted') {
          this.checkLoading = true
        } else {
          this.draftLoading = true
        }
        let keys = {...data}
        keys.encode_rule = keys.fingerCoding
        keys.add_type = type
        let JSONStr = JSON.stringify(keys)
        // console.log(JSONStr)
        let encryptStr = this.$DataEncrypt(JSONStr)
        let params = {keys: encryptStr}
        return this.$post('client?act=submit_client_finger_handler', params)
          .then((res) => {
            if (type === 'submitted') {
              this.checkLoading = false
            } else {
              this.draftLoading = false
            }
            if (res.errcode === '0') {
              this.$message.success('上传成功！')
              data.fin_id = res.data.fin_id
              this.$saveSixId(data)
              this.getTabelData()
            } else {
              this.$message.error(res.errmsg)
            }
          }).catch((e) => {
            console.log(e)
            if (type === 'submitted') {
              this.checkLoading = false
            } else {
              this.draftLoading = false
            }
            this.$message.error('上传失败！')
          })
      } else {
        this.$message.error('指纹信息不完整，请查看是否生成指纹编码！')
      }
    },
    // 服务指纹验证
    checkServer () {
      this.$refs['form_server'].validate(async (valid) => {
        if (valid) {
          this.server_loading = true
          this.activeData.host = this.form_server.ip
          this.activeData.port = this.form_server.port
          let checkBao = await this.handleDetect()
          this.server_loading = false
          if (checkBao) {
            this.serverCheck[0].info = ''
            this.serverCheck[1].info = ''
            this.serverCheck[2].info = ''
            this.serverCheck[3].info = ''
            this.showSerRes = true
            let checkRes
            if (!this.activeData.result && !this.activeData.result_16 && !this.activeData.service &&
              !this.activeData.characteristic) {
              this.$message.error('指纹信息不完整,请先完善指纹信息!')
            } else {
              let patternCha = this.$evil(`/${this.activeData.characteristic}/i`) // 特征
              if (patternCha.test(this.activeData.result)) {
                let CPEArr = this.activeData.CPE.split(':$')
                checkRes = {
                  characteristic: this.activeData.characteristic === '' ? 'none' : this.activeData.result.match(
                    patternCha)[0] === undefined ? 'unpass' : 'pass',
                  version: this.activeData.version === '' ? 'none' : RegExp[this.activeData.version] === undefined
                    ? 'unpass'
                    : 'pass',
                  extraInfo: this.activeData.extraInfo === '' ? 'none' : this.getExp(this.activeData.extraInfo) ===
                  ':undefined' ? 'unpass' : 'pass',
                  CPE: this.activeData.CPE === '' ? 'none' : RegExp[`$${CPEArr[1]}`] === undefined ? 'unpass' : 'pass'
                }
                this.serverCheck[0].info = checkRes.characteristic
                this.serverCheck[1].info = checkRes.version
                this.serverCheck[2].info = checkRes.extraInfo
                this.serverCheck[3].info = checkRes.CPE
              } else {
                this.serverCheck[0].info = 'unpass'
                this.serverCheck[1].info = 'unpass'
                this.serverCheck[2].info = 'unpass'
                this.serverCheck[3].info = 'unpass'
              }
              // this.writeLog('server', checkRes)
            }
          } else {
            this.showSerRes = false
            console.log('探测结果为false')
          }
        } else {
          return false
        }
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
        resultStr += `${key}:${obj[key]}${index !== Object.keys(obj).length - 1 ? ';' : ''}`
      })
      return resultStr
    },
    async handleDetect () {
      let params = {
        host: this.activeData.host,
        port: this.activeData.port,
        package: this.$evil(`"${this.activeData.package}"`)
      }
      console.log(params)
      let result
      if (this.activeData.protocol === 'TCP') {
        await this.$tcp(params)
          .then(res => {
            console.log(res.data)
            if (res.connect && res.timeout) {
              this.$message.error('目标已连接,回包长时间未返回!')
              result = false
            } else if (res.data) {
              this.$message.success('探测成功')
              this.activeData.result = res.data.toString()
              this.activeData.result_16 = this.stringToHex(this.activeData.result)
              result = true
            } else if (res.connect && !res.data) {
              console.log(res)
              result = false
              this.$message({
                message: '回包信息为空',
                type: 'warning'
              })
            } else if (res.timeout) {
              result = false
              this.$message.error('探测超时!')
            }
          })
          .catch((err) => {
            console.log(err)
            this.$message.error('探测失败')
            result = false
          })
      } else {
        await this.$udp(params)
          .then(res => {
            if (res.send && res.timeout) {
              this.$message.error('数据已发送,回包信息未返回!')
              result = false
            } else if (res.data) {
              this.$message.success('探测成功')
              this.activeData.result = res.data.toString()
              this.activeData.result_16 = this.stringToHex(this.activeData.result)
              result = true
            } else if (res.connect && !res.data) {
              this.$message({
                message: '回包信息为空',
                type: 'warning'
              })
              result = false
            } else if (res.timeout) {
              this.$message.error('探测超时!')
              result = false
            }
          })
          .catch(() => {
            this.$message.error('探测失败,请检查端口和目标')
            result = false
          })
      }
      return result
    },
    stringToHex (str) {
      var val = ''
      for (var i = 0; i < str.length; i++) {
        if (val === '') {
          val = str.charCodeAt(i).toString(16) // 获取字符的Unicode码然后转16进制
        } else {
          val += str.charCodeAt(i).toString(16) // 获取字符的Unicode码然后转16进制再拼接,中间用逗号隔开
        }
      }
      return val
    },
    // web指纹验证
    checkWeb () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.web_loading = true
          this.activeData.address = this.form.url
          let res = await this.$identifyFin(this.activeData, this.form.url)
          if (res === null) {
            this.$message.error('目标地址异常,请检查地址后再试!')
            this.web_loading = false
            this.showWebRes = false
            this.webCheck = {
              'headers': '',
              'html': '',
              'url': '',
              'script': '',
              'meta': '',
              'js': ''
            }
            return false
          }
          this.web_loading = false
          this.showWebRes = true
          this.webCheck = res
          // 写入日志
          // this.writeLog('web', res)
          this.getFingerList(this.activeData)
        } else {
          return false
        }
      })
    }
    // writeLog (type, data) {
    //   let logArr
    //   if (type === 'server') {
    //     logArr = [data.characteristic, data.version, data.extraInfo, data.CPE]
    //   } else {
    //     logArr = [data.headers, data.html, data.url, data.script, data.meta, data.js]
    //   }
    //   let logNum = {pass: 0, unpass: 0, none: 0}
    //   var time = new Date().getTime()
    //   for (let val of logArr) {
    //     val === 'none' ? logNum.none += 1 : val === 'pass' ? logNum.pass += 1 : logNum.unpass += 1
    //   }
    //   if (logNum.pass > 0 && logNum.unpass === 0) {
    //     this.activeData.log_pass_num += 1
    //     this.activeData.log_pass_info += this.$formatTime(time).dateTime + ' ' + this.activeData.address + ' ' + '通过' + '\n'
    //   } else if (logNum.pass > 0 && logNum.unpass > 0) {
    //     this.activeData.log_unpass_num += 1
    //     this.activeData.log_unpass_info += this.$formatTime(time).dateTime + ' ' + this.activeData.address + ' ' + '未通过' + '\n'
    //   }
    //   this.activeData.log_ratio = Number(this.activeData.log_pass_num / (this.activeData.log_pass_num + this.activeData.log_unpass_num).toFixed(2))
    //   let res = {
    //     log_pass_num: this.activeData.log_pass_num,
    //     log_pass_info: this.activeData.log_pass_info,
    //     log_unpass_num: this.activeData.log_unpass_num,
    //     log_unpass_info: this.activeData.log_unpass_info,
    //     log_ratio: this.activeData.log_ratio
    //   }
    //   this.$updateLog(res)
    // }
  },
  components: {
    UploadJson
  }
}
</script>
<style lang="less">
	.sub_page {
		.export_btn {
			border: 1px solid #E1E3EE;
			
			&:hover {
				background: #f4f4f5
			}
		}
		
		.downlaodbtn span {
			color: #fff;
		}
		
		.el-table .success-row {
			background: #f0f9eb;
		}
	}
</style>

<template>
	<div class="sub_page">
		<div class="page_title">
			<el-input
				size="medium"
				type="text"
				style="width:500px;"
				placeholder="搜索插件"
				clearable
				v-model="name"
			></el-input>
			<span>编辑模式</span>
			<el-switch v-model="edit" active-color="#52c41a" inactive-color="#bfbfbf"></el-switch>
			<!--<span style="margin-left: 20px">多选</span>-->
			<!--<el-switch v-model="Checkbox" active-color="#52c41a" inactive-color="#bfbfbf"></el-switch>-->
			<!--<el-button @click="handleDownload" style="margin-left: 20px;" size="mini" class="export_btn">导出-->
			<!--</el-button>-->
			<el-button @click="handleDownload('all')" style="margin-left: 20px;" size="mini" class="export_btn">全部导出
			</el-button>
			<div style="display: inline-block;vertical-align: middle;height: 28px;margin-top: -2px">
				<upload-json :uploadLoading="uploadLoading" ref="upload" @SendFile="ReceiveFile"></upload-json>
			</div>
		</div>
		<el-row :gutter="30" class="local_finger">
			<el-col :span="15">
				<div class="grid-content">
					<p class="left_title">本地插件</p>
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
						<!-- <el-table-column width="70">
							<template slot-scope="scope"><span style="color:#9b9b9b">{{scope.row.saved_plugin?'已上传':(!scope.row.saved_plugin && scope.row.signature !== 'mapxj'?'未上传':'')}}</span>
							</template>
						</el-table-column> -->
						<el-table-column width="100" class-name="left_type">
							<template slot-scope="scope">
								<el-popover
									placement="top-start"
									width="200"
									trigger="hover"
									:content="scope.row.remark">
									<div class="tableRemark" style="cursor: pointer" slot="reference">{{scope.row.remark}}</div>
								</el-popover>
							</template>
						</el-table-column>
						<el-table-column width="150" class-name="left_type">
							<template slot-scope="scope">
								{{typeFun(scope.row)}}
							</template>
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
										<el-dropdown-item v-if="!scope.row.vul_id" :command="{type:'authenticate',data:scope.row}">
											<el-button type="text" size="mini">认证插件</el-button>
										</el-dropdown-item>
										<el-dropdown-item :command="{type:'download'}">
											<el-button type="text" size="mini">导出</el-button>
										</el-dropdown-item>
										<el-dropdown-item :command="{type:'del',data:scope.row._id}">
											<el-button type="text" size="mini">删除</el-button>
										</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :span="9" v-if="tableData.length!==0">
				<div class="grid-content">
					<div style="display: flex;flex-direction: column" class="right_bottom" v-if="!edit">
						<!--<p class="title">验证</p>-->
						<el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px" @submit.native.prevent>
							<p class="title">检测</p>
							<el-form-item v-if="activeData.signature !=='mapxj'" label="类型：" prop="type">
								<el-select v-model="form.check_type" style="width: 100%">
									<el-option label="Web漏洞" value="web"></el-option>
									<el-option label="主机或服务漏洞" value="server"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item v-if="form.check_type ==='web'" label="URL：" prop="url">
								<el-input v-model="form.url" placeholder="请输入 http://URL"></el-input>
							</el-form-item>
							<div v-if="form.check_type!=='web' && activeData.signature !=='mapxj'">
								<el-form-item label="目标：" prop="ip">
									<el-input v-model="form.ip" placeholder="请输入IP"></el-input>
								</el-form-item>
								<el-form-item label="端口：" prop="port">
									<el-input v-model="form.port" placeholder="请输入端口"></el-input>
								</el-form-item>
							</div>
							<el-button class="six_btn" :loading="check_loading" @click="checkPlugin">检 测</el-button>
							<el-form-item style="margin-top:20px" prop="check_info" label-width="0px">
								<el-input
									placeholder=""
									:readonly="true"
									ref="returnPackage"
									class="dash_textarea"
									type="textarea"
									:rows="14"
									v-model="form.check_info">
								</el-input>
							</el-form-item>
						</el-form>
					</div>
					<div class="right_bottom" v-if="edit">
						<p class="title">概览</p>
						<el-form
							:model="form"
							size="mini"
							label-width="90px"
							label-position="left"
							class="edit_form mb20"
						>
							<el-form-item label="漏洞名称：">{{activeData.name}}</el-form-item>
							<el-form-item label="插件分类：">
								{{pluginType(activeData.vul_type)}}
							</el-form-item>
							<el-form-item label="备注：">
								<el-popover width="440" trigger="manual" :content="activeData.remark" v-model="moreDir">
									<span class="introduction" slot="reference" @click="showMoreDir(activeData.remark)">{{activeData.remark}}</span>
								</el-popover>
							</el-form-item>
						</el-form>
						<el-button
							class="six_btn"
							:loading="checkLoading"
							@click="uploadToSix(activeData,'submitted')">发布到审核
						</el-button>
						<el-button
							class="six_btn"
							:loading="draftLoading"
							@click="uploadToSix(activeData,'draft')">发布到草稿
						</el-button>
						<el-button v-if="!activeData.vul_id" class="six_btn"
											 @click="handleAuthenticate()">认证插件
						</el-button>
						<el-button class="six_btn" @click="handleEdit(activeData)">查看/编辑</el-button>
						<el-button class="six_btn" @click="handleDownload()">导出</el-button>
						<el-button class="six_btn" @click="removeData(activeData._id)">删 除</el-button>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-dialog width="60%" class="NameDialog" title="认证插件" :visible.sync="dialogNameVisible">
			<el-form style="height: 150px" :model="Vulform" ref="Vulform" label-width="120px" size="small">
				<el-form-item label="漏洞名称：" prop="name">
					<el-select
						@change="watchName"
						ref="name_select"
						clearable
						style="width: 90%"
						:remote-method="remoteMethod"
						filterable
						remote
						class="input_width"
						size="medium"
						v-model="Vulform.name"
						placeholder="请选择漏洞名称">
						<el-option
							style=""
							v-for="(item,index) in vulName"
							:key="index"
							:label="`${item.name}${item.CVE?'('+ item.CVE+')': ''}`"
							:value="JSON.stringify(item)">
						</el-option>
					</el-select>
				</el-form-item>
				<p class="align-c" style="margin-top:70px">
					<el-button :loading="CAloading" @click="BtnAuthenticate" size="medium" type="primary">认证</el-button>
				</p>
			</el-form>
		</el-dialog>
	</div>
</template>
<script>
import { deleteFolder, getStepData } from '@/assets/js/common.js'
import { remote } from 'electron'
import UploadJson from '@/components/UploadJSON'

let Buffer = require('safe-buffer').Buffer
const compressing = require('compressing')
let Base64 = require('js-base64').Base64
// var jschardet = require('jschardet')
// var encoding = require('encoding')
// let iconv = require('iconv-lite')
var JSZip = require('jszip')
var zip = new JSZip()

let fs = require('fs')
let path = require('path')
export default {
  data () {
    return {
      CAloading: false, // 认证loading
      Vulform: {
        name: '',
        vul_id: ''
      },
      oldName: [], // 获取漏洞名称数组
      vulName: [], // 获取漏洞名称数组
      dialogNameVisible: false,
      uploadLoading: 'false',
      checkLoading: false,
      draftLoading: false,
      Checkbox: false,
      checkArr: [true],
      plugin_type: require('../../../../static/json/plugin_type'),
      tableData: [],
      name: '',
      show: false,
      edit: false,
      moreDir: false,
      activeData: '',
      check_loading: false,
      form: {
        url: '',
        ip: '',
        port: '',
        check_info: '',
        check_type: 'web'
      },
      rules: {
        ip: [{required: true, message: '请输入IP地址', trigger: 'blur'}],
        port: [{required: true, message: '请输入端口号', trigger: 'blur'}],
        url: [{required: true, message: '请输入地址', trigger: 'blur'}]
      },
      server_loading: false, // 按钮加载
      web_loading: false,
      fingerList: [], // 指纹列表
      $Blob: ''
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
    edit () {
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },
    'form.check_type' (val) {
      this.$refs.form.resetFields()
      this.form.check_type = val
    }
  },
  mounted () {
    this.getTabelData()
    if (this.$store.state.isOnline) {
      this.getVulName()
    }
  },
  methods: {
    BtnAuthenticate () {
      if (!this.Vulform.vul_id) {
        this.$message.error('未选择认证的漏洞的名称!')
        return false
      }
      let _this = this
      this.CAloading = true
      console.log(this.Vulform)
      let name = ''
      let vul_id = this.Vulform.vul_id
      try {
        name = JSON.parse(this.Vulform.name).name
      } catch (e) {
        this.CAloading = false
        this.$message.error('数据错误!')
        console.log(e)
      }
      let _id = this.activeData._id
      if (this.activeData.signature !== 'mapxj') { // mapx_in
        let tplTxt = fs.readFileSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/main.py`), 'utf-8')
        let regName = new RegExp(this.activeData.name, 'g') // 名字,info_id替换
        tplTxt = tplTxt
          .replace(regName, name)
          .replace('{mapx: info_id}', vul_id)
          .replace('{mapx: description}', '')
          .replace('{mapx: product}', '')
          .replace('{mapx: level}', '')
        // console.log(tplTxt)
        fs.writeFileSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/main.py`), tplTxt)
        deleteFolder(path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`))
        let files = fs.readdirSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/`))
        console.log(files)
        for (let i in files) {
          if (fs.statSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/${files[i]}`)).isDirectory()) {
            zip.folder(files[i])
          } else {
            let zipBuffer = fs.readFileSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/${files[i]}`))
            zip.file(files[i], zipBuffer) // 创建的json
          }
        }
        zip.generateAsync({
          type: 'base64',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9
          }
        }).then(function (content) {
          // console.log(content)
          fs.writeFileSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`), content, 'base64')
        }).catch(function (e) {
          _this.CAloading = false
          console.log(e)
        })
      }
      this.$message.success('插件认证成功')
      this.$updatePlugin({_id: _id, vul_id: vul_id, name: name})
      this.CAloading = false
      this.dialogNameVisible = false
      this.getTabelData()
      this.Vulform = {
        name: '',
        vul_id: ''
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
    watchName (val) {
      console.log('改变了')
      try {
        if (val) {
          let obj = JSON.parse(val)
          this.Vulform.vul_id = obj.vul_id
        } else {
          this.Vulform.vul_id = ''
        }
      } catch (e) {
        this.Vulform.vul_id = ''
        console.log(e)
      }
    },
    async ReceiveFile (val) {
      this.uploadLoading = true
      await this.$sleep(1000)
      let _this = this
      console.log(val)
      this.readBlobAsDataURL(val, function (res) {
        console.log(res)
        let base64Str = res.match(/[^,],(.+)/)[1]
        let base64ToStr = Base64.decode(base64Str)
        let str = _this.$FileDecrypt(base64ToStr)
        console.log(str)
        let dataurl = `data:application/x-zip-compressed;base64,${str}`
        let BlobBoj = _this.dataURLtoBlob(dataurl)
        if (BlobBoj) {
          _this.BlobToFile(BlobBoj) // 转化成本地文件
        } else {
          _this.uploadLoading = false
          return false
        }
      })
    },
    BlobToFile (BlobBoj) { // 转化成本zip地文件
      try {
        deleteFolder(path.join(remote.app.getPath('userData'), `./uploadjson.zip`)) // 将的poc文件的删除后新建的文件的
        let _this = this
        var reader = new FileReader()
        reader.readAsArrayBuffer(BlobBoj)
        reader.onload = function () {
          console.log(this.result)
          let buffer = new Buffer(this.result)
          console.log(buffer)
          console.log('写文件权限')
          fs.writeFile(path.join(remote.app.getPath('userData'), `./uploadjson.zip`), buffer, (err, res) => {
            if (err) {
              console.error(err)
              return false
            }
            // _this.$message.success('数据导入成功!')
            console.log('数据导入成功!')
            _this.compressUpload()
          })
        }
      } catch (e) {
        this.uploadLoading = false
        this.$message.error('导入失败')
        console.log(e)
      }
    },
    compressUpload () { // 将本地文件进行解压
      let _this = this
      // let fileState = fs.existsSync(path.join(remote.app.getPath('userData'), `./uploadLocal`))
      // if (fileState) { // // 判断poc文件的内有没有的_id文件的夹
      console.log('删除文件1')
      deleteFolder(path.join(remote.app.getPath('userData'), `./uploadLocal`)) // 将的poc文件的删除后新建的文件的
      console.log('删除文件1')
      // }
      fs.mkdir(path.join(remote.app.getPath('userData'), `./uploadLocal`), function (err) {
        if (err) {
          this.uploadLoading = false
          console.log(err)
          return false
        } else {
          console.log('进行解压之前')
          try {
            compressing.zip.uncompress(path.join(remote.app.getPath('userData'), './uploadjson.zip'),
              path.join(remote.app.getPath('userData'), './uploadLocal'))
              .then(() => {
                console.log('解压成功')
                _this.getPluginJson() // 读取josn文件,进行的数据的的导入
              })
              .catch(err => {
                console.log(err)
                this.uploadLoading = false
              })
          } catch (e) {
            this.uploadLoading = false
            console.log('shibai')
            console.log(e)
          }
        }
      })
    },
    getPluginJson () { // 读取的json文件的获取数据
      let _this = this
      fs.readFile(path.join(remote.app.getPath('userData'), `./uploadLocal/plugin.json`), 'utf-8',
        function (err, str) {
          if (err) {
            console.log(err)
            this.uploadLoading = false
            return false
          }
          console.log(str)
          _this.checkLoacl(str) // 获取的文件的内容和本地的数据的进行对比
        })
    },
    async checkLoacl (str) { // 对比本地的数据确
      this.gridData = []
      let files = fs.readdirSync(path.join(remote.app.getPath('userData'), `./uploadLocal`))
      console.log(files)
      try {
        let arr = JSON.parse(str).RECORDS // 获取到的数据
        for (let i in arr) {
          let res = await this.$findOnePlugin({_id: arr[i]._id}) // 查询本地是否存在
          console.log(res)
          if (res) { // 本地数据的存在存在,需要的判断的是否进行的覆盖
            console.log('进行修改的本地数据')
            this.gridData.push(res)
          } else { // 新数据,本地的数据的,进行的保存
            console.log('进行插入新数据')
            let saveInfo = await this.$saveJsonPlugin(arr[i])
            console.log(saveInfo)
            if (files.length > 1) {
              this.saveToLocalZip(arr[i]) // 进行的压缩的文件的覆盖
            }
          }
        }
        // 判断数据是否进行覆盖的处理
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
              await this.$updateJsonPlugin(this.gridData[i])
              if (files.length > 1) {
                this.saveToLocalZip(this.gridData[i]) // 进行的压缩的文件的覆盖
              }
            }
            this.getTabelData()
          }).catch((e) => {
            console.log(e)
          })
        } else {
          this.$message({
            type: 'success',
            message: '导入成功!'
          })
          this.getTabelData()
          this.uploadLoading = false
        }
      } catch (e) {
        console.log(e)
        this.uploadLoading = false
      }
    },
    saveToLocalZip (data) { // 将文件保存到本地
      let _this = this
      let _id = data._id
      // let fileState = fs.existsSync(path.join(remote.app.getPath('userData'), `./poc/${_id}`))
      // if (fileState) { // // 判断poc文件的内有没有的_id文件的夹
      //
      // }
      deleteFolder(path.join(remote.app.getPath('userData'), `./poc/${_id}`)) // 将的poc文件的删除后新建的文件的
      fs.mkdir(path.join(remote.app.getPath('userData'), `./poc/${_id}`), function (err) {
        if (err) {
          console.log(err)
          return false
        } else {
          _this.copyIt(path.join(remote.app.getPath('userData'), `./uploadLocal/uploadjson/${_id}.zip`),
            path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`)) // 将uploadjson 转移到的poc/_id 文件下
          try {
            compressing.zip.uncompress(path.join(remote.app.getPath('userData'), `./poc/${_id}/${_id}.zip`),
              path.join(remote.app.getPath('userData'), `./poc/${_id}`)) // 进行copy进行存放
            console.log(`当前数据已经的解压成功${_id}`)
          } catch (e) {
            console.log(e)
          }
        }
      })
    },
    copyIt (from, to) { // copy 复制的文件
      fs.writeFileSync(to, fs.readFileSync(from))
    },
    dataURLtoBlob (dataurl) {
      try {
        let arr = dataurl.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {type: mime})
      } catch (e) {
        this.uploadLoading = false
        this.$message.error('导入的失败,请的确认导入文件正确性')
        console.log(e)
      }
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
      let _this = this
      let data = []
      if (type === 'all') {
        let res = await this.$searchPlugin({name: ''})
        data = res.data
        console.log(data)
      } else {
        data = [this.activeData]
      }
      if (data && data.length > 0) {
        let jsonData = JSON.stringify({'RECORDS': data})
        zip.file('plugin.json', jsonData) // 创建的json
        for (let i in data) {
          if (data[i].saved_plugin) {
            let zipBuffer = fs.readFileSync(
              path.join(remote.app.getPath('userData'), `./poc/${data[i]._id}/${data[i]._id}.zip`))
            zip.file(`uploadjson/${data[i]._id}.zip`, zipBuffer) // 创建的json
          }
        }
        console.log('输入的结束')
        zip.generateAsync({
          type: 'base64',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9
          }
        }).then(function (content) {
          // console.log('产生baseq64编码======>' + content)
          let encryptBase64 = _this.$FileEncrypt(content)
          // console.log('对base64编码加密===>' + encryptBase64)
          let blob = new Blob([encryptBase64], {type: 'application/octet-stream'})
          // console.log(blob)
          _this.downFile(blob, 'plugin.zip')
        })
      } else {
        this.$message.error('请先勾选需要导出的数据!')
      }
    },
    Ispublish () {
      // (activeData.submit_type !== 'online' && activeData.signature !=='mapxj') && (activeData.check_info !== 'success' && activeData.signature !=='mapxj')
      // if (this.activeData.signature !== 'mapxj') {
      //   return !(this.$store.state.isOnline)
      // } else {
      //   return !(this.activeData.vul_id && this.$store.state.isOnline)
      // }
      return !this.$store.state.isOnline
    },
    typeFun (row) {
      // {{scope.row.submit_type==='online'?'MAPX(在线)':(scope.row.submit_type==='offline'?'MAPX(离线)':'MAPX_MIN')}}
      if (row.signature === 'mapxj') {
        if (row.vul_id) {
          return 'MAPX_MIN(认证)'
        } else {
          return 'MAPX_MIN(未认证)'
        }
      } else {
        if (row.vul_id) {
          return 'MAPX(认证)'
        } else {
          return 'MAPX(未认证)'
        }
      }
    },
    pluginType (val) {
      if (val) {
        let selectedVal = this.plugin_type.filter(item => item.type === val)[0]
        return selectedVal.chinese
      }
    },
    checkPlugin () {
      this.check_loading = true
      this.form.check_info = ''
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          if (this.activeData.signature === 'mapxj') {
            console.log(this.activeData)
            let res = await getStepData(this.activeData.testData[0], this.form.url, this.activeData.checks)
            if (res.res) {
              this.form.check_info = '存在漏洞'
            } else {
              this.form.check_info = '不存在漏洞'
            }
            this.check_loading = false
          } else {
            console.log(this.form.url)
            console.log(this.activeData._id)
            let params = {
              fileName: this.activeData._id,
              check_type: this.form.check_type,
              url: this.form.url,
              ip: this.form.ip,
              port: this.form.port,
              source: 'file'
            }
            console.log(params)
            this.form.check_info = await this.$checkPoc(params, 'detect_uri')
            this.check_loading = false
          }
        } else {
          this.check_loading = false
          return false
        }
      })
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
    handleCommand (command) {
      if (command.type === 'edit') {
        this.handleEdit(command.data)
      } else if (command.type === 'del') {
        this.removeData(command.data)
      } else if (command.type === 'download') { // 导出功能
        this.handleDownload()
      } else if (command.type === 'authenticate') { // 认证功能
        if (!this.$store.state.isOnline) {
          this.$message.error('当前处于离线转态,请切换为在线状态!')
        } else {
          this.handleAuthenticate()
        }
      }
    },
    async handleAuthenticate () {
      if (!this.$store.state.isOnline) {
        this.$message.error('当前处于离线转态,请切换为在线状态!')
        return false
      }
      this.dialogNameVisible = true
      await this.$sleep(500)
      document.querySelector('.el-select-dropdown').style.maxWidth = '80%'
    },
    handleEdit (row) {
      if (row.signature && row.signature === 'mapxj') {
        this.$router.push({name: 'CreateMAPX_MIN', query: {_id: row._id}})
      } else if (row.submit_type === 'online') {
        this.$router.push({name: 'CreatePlugin', query: {_id: row._id, type: 'online'}})
      } else if (row.submit_type === 'offline') {
        this.$router.push({name: 'CreatePlugin', query: {_id: row._id, type: 'offline'}})
      }
    },
    getTabelData () {
      this.$searchPlugin({
        name: this.name
      })
        .then(res => {
          if (res.data && res.data.length > 0) {
            // console.log(res.data)
            // console.log(JSON.stringify(res.data))
            this.tableData = res.data
            this.activeData = {...res.data[0]}
            this.checkArr = [true]
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
      // console.log(JSON.stringify(row))
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
      }
      if (!this.edit) {
        this.$nextTick()
          .then(() => {
            this.$refs.form.resetFields()
          })
      }
    },
    removeData (_id) {
      this.$confirm('此操作将永久删除数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$removePlugin({_id: _id})
          .then(res => {
            deleteFolder(path.join(remote.app.getPath('userData'), `./poc/${_id}`))
            console.log(res._id)
            this.getTabelData()
          })
          .catch(err => {
            console.log(err)
          })
      }).catch(() => {
      })
    },
    readBlobAsDataURL (blob, callback) {
      var a = new FileReader()
      a.onload = function (e) { callback(e.target.result) }
      a.readAsDataURL(blob)
    },
    getBlob (params) {
      return new Promise((resolve, reject) => {
        let _this = this
        if (params.plugin_name) {
          console.log(path.join(remote.app.getPath('userData'), `./poc/${params._id}/${params._id}.zip`))
          fs.readFile(path.join(remote.app.getPath('userData'), `./poc/${params._id}/${params._id}.zip`), 'base64',
            function (err, bin) {
              if (err) throw err
              console.log(bin)
              let binStr = _this.$SixFileEncrypt(bin)
              binStr = Base64.encode(binStr)
              console.log(binStr)
              fs.writeFile(path.join(remote.app.getPath('userData'), `./rsafile.zip`), binStr, 'utf-8',
                (err, res) => {
                  if (err) {
                    console.error(err)
                    return false
                  }
                  fs.readFile(path.join(remote.app.getPath('userData'), `./rsafile.zip`), function (err, content) {
                    console.log(err)
                    console.log(content)
                    let Bolb = new Blob([new Uint8Array(content)], {type: 'application/octet-stream'}) // buffer数组的转化成Blobleixi
                    resolve(Bolb)
                  })
                })
            })
        }
      })
    },
    getBlobBydataURI (dataURI, type) {
      var binary = dataURI.split(',')[1]
      console.log(binary)
      binary = this.$SixFileEncrypt(binary) // 加密文件的
      console.log(binary)
      var array = []
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      console.log(array)
      return new Blob([new Uint8Array(array)], {type: type})
    },
    checkvulID () { // 判断文件的ID和选着漏洞的iD是否相同
      let _id = this.activeData._id
      let vul_id = this.activeData.vul_id
      let tpl_vul = fs.readFileSync(path.join(remote.app.getPath('userData'), `./poc/${_id}/main.py`), 'utf-8')
      console.log(tpl_vul)
      let info_id = tpl_vul.match(/"info_id":\s*'(.*)',/)[1]
      if (info_id !== vul_id) {
        return false
      } else {
        return true
      }
    },
    async uploadToSix (data, type) {
      if (!this.$store.state.isOnline) {
        this.$message.error('当前为离线状态,不能发布')
        return false
      }
      if (!this.activeData.vul_id) {
        this.$message.error('当前漏洞插件未认证,请先认证')
        return false
      }
      if (data.signature && data.signature === 'mapxj') {
        this.uploadMIN(data, type)
      } else { // 提交的mpax插件
        let formBlob = ''
        if (type === 'submitted') { // 发布六耳审核
          if (this.activeData.check_info !== 'success') {
            this.$message.error('请检查poc是否上传和py脚本格式是否正确!')
            return false
          }
          if (!this.checkvulID()) { // 判断id是否相同
            this.$message.error('漏洞名称修改后,未重新生成模板!')
            return false
          }
          formBlob = await this.getBlob(data)
          console.log(formBlob)
          console.log(data.plugin_name)
        }
        if (type === 'submitted') {
          this.checkLoading = true
        } else {
          this.draftLoading = true
        }
        let form = new FormData()
        let keys = {
          add_type: type,
          plugin_id: data.plugin_id,
          CVE: data.CVE,
          name: data.name,
          vul_type: data.vul_type,
          compatibility: data.compatibility,
          query: data.query,
          use_flag: data.use_flag,
          remark: data.remark,
          python_lib_list: data.python_lib_list,
          vul_id: data.vul_id,
          url: data.check_type === 'web' ? data.url : `http:${data.ip}:${data.port}`
        }
        let JSONStr = JSON.stringify(keys)
        console.log(keys)
        let params = this.$DataEncrypt(JSONStr)
        if (formBlob) {
          form.append('plugin', formBlob, `${data._id}.zip`)
        } else {
          form.append('plugin', '')
        }
        form.append('keys', params)
        form.append('upload_poc_type', 'mapx')
        this.$post('client?act=submit_client_poc_handler', form, {'upload': true})
          .then((res) => {
            if (type === 'submitted') {
              this.checkLoading = false
            } else {
              this.draftLoading = false
            }
            if (res.errcode === '0') {
              this.$message.success('上传成功！')
              data.plugin_id = res.data.plugin_id
              console.log(data)
              this.$saveSixIdPlugin(data)
              this.getTabelData()
            } else {
              this.$message.error(res.errmsg)
            }
          }).catch(() => {
            if (type === 'submitted') {
              this.checkLoading = false
            } else {
              this.draftLoading = false
            }
            this.$message.error('上传失败！')
          })
      }
    },
    uploadMIN (data, type) {
      if (type === 'submitted') {
        if (!data.vul_type) { // 这里判断必填字段的时候填写完整
          this.$message.error('漏洞类型未填写!')
          return false
        } else if (!data.query) {
          this.$message.error('请填写受影响实体')
          return false
        }
        this.checkLoading = true
      } else {
        this.draftLoading = true
      }
      let keys = {
        add_type: type,
        ...data,
        mapx_min_signature: data.signature,
        mapx_min_checks: data.checks,
        mapx_min_steps: data.steps
      }
      console.log(keys)
      let JSONStr = JSON.stringify(keys)
      // console.log(JSONStr)
      let params = this.$DataEncrypt(JSONStr)
      let form = {
        keys: params,
        upload_poc_type: 'mapx_min'
      }
      this.$post('client?act=submit_client_poc_handler', form)
        .then((res) => {
          if (type === 'submitted') {
            this.checkLoading = false
          } else {
            this.draftLoading = false
          }
          if (res.errcode === '0') {
            this.$message.success('上传成功！')
            data.plugin_id = res.data.plugin_id
            console.log(data)
            this.$saveSixIdPlugin(data)
            this.getTabelData()
          } else {
            this.$message.error(res.errmsg)
          }
        }).catch(() => {
          if (type === 'submitted') {
            this.checkLoading = false
          } else {
            this.draftLoading = false
          }
          this.$message.error('上传失败！')
        })
    }
  },
  components: {
    UploadJson
  }
}
</script>
<style lang="less">
	@import (reference) "../../../renderer/assets/style/mixin";
	
	.el-select-dropdown {
		/*max-width: 600px !important;*/
	}
	
	.sub_page {
		.tableRemark {
			.line-clamp(1)
		}
		
		.export_btn {
			border: 1px solid #E1E3EE;
			
			&:hover {
				background: #f4f4f5
			}
		}
		
		.el-table .success-row {
			background: #f0f9eb;
		}
		
		.dash_textarea {
			textarea {
				border: 2px dashed #d4dAE2;
			}
		}
	}
</style>

<template>
	<div class="select_type update_finger">
		<div>
			<i class="iconfont icon-tongbu left"></i>
			<div class="right" v-if="selected==='' || selected === 'downloadDB' ">
				<p class="title">同步或管理插件</p>
				<p class="content">同步插件采用差量更新的方法，将本地插件上传到云端或将云端插件下载到本地</p>
				<p class="content">本地或云端名称相同的插件，按插件更新时间由新插件替换旧插件</p>
				<div class="mt20 mb30">
					<!-- <div style="margin-bottom: 20px">
						<el-radio v-model="radio" label="downloadDB">导出插件</el-radio>
						<el-radio v-model="radio" label="uploadDB">导入插件</el-radio>
					</div> -->
					<!-- <div> -->
						<el-radio v-model="radio" label="upload">上传到云端</el-radio>
						<el-radio v-model="radio" label="download">下载到本地</el-radio>
						<el-radio v-model="radio" label="handleCloud">管理云端插件</el-radio>
					<!-- </div> -->
				</div>
				<p>
					<el-button class="btn"
										 :disabled="(!$store.state.isOnline) && (radio === 'upload' || radio === 'download' || radio === 'handleCloud')"
										 type="primary" @click="start">开 始
					</el-button>
				</p>
			</div>
			<div class="right" v-if="selected==='upload'">
				<p class="title">上传到云端</p>
				<p class="content">当前：本地插件 {{localList?localList.length:0}} 个</p>
				<p class="content">当前：云端插件 {{checkData.cloud_num}} 个</p>
				<div class="info">云端插件新增 {{checkData.add_num}} 个，更新 {{checkData.update_num}} 个，忽略 {{checkData.ignore_num}} 个
				</div>
				<p class="info" v-if="!finished&&!error">正在同步......</p>
				<p class="info" v-if="finished">同步完成！</p>
				<p class="info red" v-if="error">同步失败，请重试！</p>
			</div>
			<div class="right" v-if="selected==='download'">
				<p class="title">下载到本地</p>
				<p class="content">当前：云端插件 {{checkData.cloud_num}} 个</p>
				<p class="content">当前：本地插件 {{localList?localList.length:0}} 个</p>
				<div class="info">本地插件新增 {{checkData.add_num}} 个，更新 {{checkData.update_num}} 个，忽略 {{checkData.ignore_num}} 个
				</div>
				<p class="info" v-if="!finished&&!error">正在同步......</p>
				<p class="info" v-if="finished">同步完成！</p>
				<p class="info red" v-if="error">同步失败，请重试！</p>
			</div>
			<div class="right" v-if="selected==='uploadDB'">
				<p class="title">导入zip文件</p>
				<upload-json style="width: 180px" :PropsFilList="PropsFilList" ref="upload"
										 @SendFile="ReceiveFile">
				</upload-json>
			</div>
		</div>
		<login :visible='showLogin' @isLogin="rebackInfo" ref="login"></login>
	</div>
</template>

<script>
import md5 from 'blueimp-md5'
import { mapState } from 'vuex'
import { deleteFolder } from '@/assets/js/common.js'
import { remote } from 'electron'
import UploadJson from '@/components/UploadJSON'
import { Base64 } from 'js-base64'
import Login from '@/components/Login'

let fs = require('fs')
let path = require('path')
let Buffer = require('safe-buffer').Buffer
const compressing = require('compressing')
var JSZip = require('jszip')
var zip = new JSZip()
export default {
  data () {
    return {
      gridData: [],
      PropsFilList: '', // 上传文件的列表
      radio: 'upload',
      selected: '',
      finished: false,
      error: false,
      localData: null,
      localList: null,
      localIdArr: [],
      checkData: {
        cloud_num: 0,
        add_num: 0,
        update_num: 0,
        ignore_num: 0
      },
      timeout: null,
      showLogin: false
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  watch: {
    radio (val) {
      if ((val === 'download' || val === 'handleCloud' || val === 'upload') && (!this.$store.state.isOnline)) {
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
    }
  },
  mounted () {
    this.getLocalList()
    // console.log(Base64.decode(this.$DataDecrypt(''))) // 测试同步文件加密
  },
  beforeRouteLeave (to, from, next) {
    if (!this.timeout) {
      window.clearTimeout(this.timeout)
    }
    next()
  },
  methods: {
    rebackInfo (val) {
      this.showLogin = val
    },
    start () {
      if (this.radio === 'handleCloud') {
        this.selected = 'handleCloud'
        this.$router.push('PluginCloud')
      } else if (this.radio === 'upload') {
        if (this.localList && this.localList.length > 0) {
          this.checkCloud('upload')
          this.selected = 'upload'
        } else {
          this.$message.error('本地没有新数据!')
        }
      } else if (this.radio === 'uploadDB') {
        this.selected = 'uploadDB' // 导入
      } else if (this.radio === 'downloadDB') {
        this.selected = 'downloadDB' // 导出
        this.handleDownload()
      } else {
        this.selected = 'download'
        this.checkCloud('download')
      }
    },
    async handleDownload () {
      let _this = this
      let res = await this.$searchPlugin({name: ''})
      if (res.data && res.data.length > 0) {
        let jsonData = JSON.stringify({'RECORDS': res.data})
        zip.file('plugin.json', jsonData) // 创建的json
        for (let i in res.data) {
          if (res.data[i].saved_plugin) {
            let zipBuffer = fs.readFileSync(
              path.join(remote.app.getPath('userData'), `./poc/${res.data[i]._id}/${res.data[i]._id}.zip`))
            zip.file(`uploadjson/${res.data[i]._id}.zip`, zipBuffer) // 创建的json
            console.log(i)
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
          console.log('产生baseq64编码======>' + content)
          let encryptBase64 = _this.$FileEncrypt(content)
          console.log('对base64编码加密===>' + encryptBase64)
          let blob = new Blob([encryptBase64], {type: 'application/octet-stream'})
          console.log(blob)
          _this.downFile(blob, 'plugin.zip')
        })
      } else {
        this.$message.error('本地列表为空!')
      }
    },
    ReceiveFile (val) {
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
        _this.BlobToFile(BlobBoj) // 转化成本地文件
      })
    },
    BlobToFile (BlobBoj) { // 转化成本zip地文件
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
          _this.$message.success('数据导入成功!')
          console.log('数据导入成功!')
          _this.compressUpload()
        })
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
              })
          } catch (e) {
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
          }).catch((e) => {
            console.log(e)
          })
        } else {
          this.$message({
            type: 'success',
            message: '导入成功!'
          })
        }
      } catch (e) {
        console.log(e)
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
    dataURLtoBlob (dataurl) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], {type: mime})
    },
    str2ab (str) {
      return new Promise((resolve, reject) => {
        let b = new Blob([str], {type: 'application/octet-stream'})
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
    // 获取本地插件列表
    getLocalList () {
      this.$searchPlugin({name: ''})
        .then(res => {
          console.log(res)
          if (res.data.length > 0) {
            // console.log(res.data)
            this.localData = res.data
            let _this = this
            // console.log(this.localData)
            this.localList = res.data.map(item => {
              _this.localIdArr.push(item._id)
              let val = {
                '_id': item._id,
                'update_time': item.update_time
              }
              return val
            })
          } else {
            this.localData = []
            this.localList = []
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 与云端信息交互
    checkCloud (type) {
      let parames = {
        client_data: JSON.stringify(this.localList),
        use_for: type,
        data_type: 'plugin'
      }
      this.$post('client?act=check_client_statistics_handler', parames)
        .then(res => {
          if (res.errcode === '0') {
            this.checkData = {
              cloud_num: res.data.yun_plugin_count,
              add_num: res.data.new_plugin_count,
              update_num: res.data.update_plugin_count,
              ignore_num: res.data.ignore_plugin_count
            }
            if (type === 'upload') {
              let updateList = []
              console.log(res.data.update_plugin_list)
              res.data.update_plugin_list.forEach(item => {
                for (let val of this.localData) {
                  if (val._id === item) {
                    val.create_user = this.userInfo.user_id
                    updateList.push(val)
                    break
                  }
                }
              })
              console.log(updateList)
              this.upload(updateList, res.target_uuid)
            } else if (type === 'download') {
              this.download(res.data.update_plugin_list, res.target_uuid)
            }
          } else {
            this.$message.error(res.errmsg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 上传数据
    /*
    * 打包文件上传
    * */
    copyIt (from, to) { // copy 复制的文件
      fs.writeFileSync(to, fs.readFileSync(from))
    },
    zipFile (data) {
      console.log(data)
      return new Promise((resolve, reject) => {
        // let data = [{'_id': 'yoThJzg5gktZFLxn'}, {'_id': 'Rrzm8gjKOV94IlDN'}]
        deleteFolder(path.join(remote.app.getPath('userData'), `./uploadplugin`))
        console.log('删除了')
        // fs.mkdirSync(path.join(remote.app.getPath('userData'), `./uploadplugin`))
        fs.mkdir(path.join(remote.app.getPath('userData'), `./uploadplugin`), function (err) {
          if (err) {
            console.log(err)
          }
          console.log('循环开始')

          function copyIt (from, to) {
            fs.writeFileSync(to, fs.readFileSync(from))
          }

          console.log(data.signature === 'mapxj')
          for (let i in data) {
            if (!(data[i].signature && data[i].signature === 'mapxj')) {
              console.log(data[i]._id)
              try {
                copyIt(path.join(remote.app.getPath('userData'), `./poc/${data[i]._id}/${data[i]._id}.zip`),
                  path.join(remote.app.getPath('userData'), `./uploadplugin/${data[i]._id}.zip`))
              } catch (e) {
                console.log(e)
              }
            }
          }
          console.log('复制完成')
          compressing.zip.compressDir(path.join(remote.app.getPath('userData'), `./uploadplugin`),
            path.join(remote.app.getPath('userData'), `./uploadplugin.zip`))
            .then((res) => {
              console.log('压缩完成')
              resolve(true)
            })
            .catch((err) => {
              console.log(err)
            })
        })
      })
    },
    getBlob () {
      let _this = this
      return new Promise((resolve, reject) => {
        fs.readFile(path.join(remote.app.getPath('userData'), `./uploadplugin.zip`), 'base64',
          function (err, bin) {
            if (err) throw err
            // console.log(bin)
            let binStr = _this.$SixFileEncrypt(bin)
            // binStr = Base64.encode(binStr)
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
      })
    },
    readBlobAsDataURL (blob, callback) {
      var a = new FileReader()
      a.onload = function (e) { callback(e.target.result) }
      a.readAsDataURL(blob)
    },
    getBlobBydataURI (dataURI, type) {
      var binary = dataURI.split(',')[1]
      console.log(binary)
      binary = this.$SixFileEncrypt(binary) // 加密文件
      console.log(binary)
      var array = []
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      console.log(array)
      return new Blob([new Uint8Array(array)], {type: type})
    },
    async upload (data, id) {
      console.log(data)
      if (!await this.zipFile(data)) return false
      let blob = await this.getBlob()
      console.log(blob)
      let form = new FormData()
      form.append('plugin_list', this.$DataEncrypt(JSON.stringify(data)))
      form.append('upload_id', id)
      form.append('keys', md5(JSON.stringify(data)))
      form.append('plugin_file', blob, 'uploadplugin.zip')
      this.$post('client?act=client_upload_data_handler', form, {'upload': true})
        .then(res => {
          if (res.errcode === '0') {
            this.finished = true
            let _this = this
            this.timeout = setTimeout(function () {
              _this.selected = ''
            }, 10000)
          } else {
            this.error = true
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 下载数据
    downloadPlugin (val, id) {
      let _this = this
      let params = {
        poc_list: JSON.stringify(val),
        download_id: id
      }
      this.$post('client?act=client_poc_download_handler', params, {responseType: 'blob'}).then((response) => {
        console.log(response)
        var reader = new FileReader()
        reader.readAsArrayBuffer(response)
        console.log(response)
        reader.onload = function () {
          var buffer = new Buffer(this.result)
          console.log(buffer)
          fs.writeFile(path.join(remote.app.getPath('userData'), `./downRsa.zip`), buffer, (err, res) => {
            if (err) {
              _this.error = true
              console.error(err)
              return false
            }
            fs.readFile(path.join(remote.app.getPath('userData'), `./downRsa.zip`), 'utf-8', function (err, data) {
              if (err) throw err
              console.log(data)
              let str = _this.$SixFileDecrypt(data)
              console.log(str)
              fs.writeFile(path.join(remote.app.getPath('userData'), `./downplugin.zip`), str, 'base64',
                function (err, data) {
                  if (err) {
                    _this.error = true
                    console.log(err)
                  }
                  _this.compresszip() // 从云端下载到插件的的压缩的文件的进行,解压的到本地
                })
            })
            console.log('下载数据成功')
          })
        }
      })
      // if (response.errmsg) {
      //   this.$message.error(response.errmsg)
      // } else {
      //   _this.readBlobAsDataURL(response, function (res) {
      //     console.log(res)
      //     let base64Str = res.match(/[^,],(.+)/)[1]
      //     console.log(base64Str)
      //     base64Str = Base64.decode(base64Str)
      //     console.log(base64Str)
      //     let str = _this.$SixFileDecrypt(base64Str)
      //     console.log(str)
      //     fs.writeFile(path.join(remote.app.getPath('userData'), `./downplugin.zip`), 'base64', (err, res) => {
      //       if (err) {
      //         console.error(err)
      //         return false
      //       }
      //       _this.compresszip() // 从云端下载到插件的的压缩的文件的进行,解压的到本地
      //       console.log('下载数据成功')
      //     })
      //   })
      // }

      //   }
      // })
    },
    compresszip () {
      let _this = this
      let filestate = fs.existsSync(path.join(remote.app.getPath('userData'), `./downplugin`))
      if (filestate) {
        deleteFolder(path.join(remote.app.getPath('userData'), `./downplugin`))
      }
      fs.mkdir(path.join(remote.app.getPath('userData'), `./downplugin`), function (err) {
        if (err) {
          console.log(err)
          return false
        } else {
          console.log('创建文件===>进行解压')
          compressing.zip.uncompress(path.join(remote.app.getPath('userData'), `./downplugin.zip`),
            path.join(remote.app.getPath('userData'), `./downplugin`))
            .then(() => {
              console.log('解压成功')
              _this.saveDownFile() // 将解压的后的文件压缩包, 进行转存的poc
              _this.finished = true
            })
            .catch(err => {
              _this.error = true
              console.error(err)
            })
        }
      })
    },
    saveDownFile () { // 将解压的后的文件压缩包, 进行转存的poc
      let files = fs.readdirSync(path.join(remote.app.getPath('userData'), `./downplugin`))
      let _this = this
      for (let i in files) {
        let fileName = files[i].match(/(.+).zip$/)[1]
        console.log(files[i])
        let fileState = fs.existsSync(path.join(remote.app.getPath('userData'), `./poc/${fileName}`))
        if (fileState) { // // 判断poc文件的内有没有的_id文件的夹
          deleteFolder(path.join(remote.app.getPath('userData'), `./poc/${fileName}`)) // 将的poc文件的删除后新建的文件的
        }
        fs.mkdir(path.join(remote.app.getPath('userData'), `./poc/${fileName}`), function (err) {
          if (err) {
            console.log(err)
            return false
          } else {
            _this.copyIt(path.join(remote.app.getPath('userData'), `./downplugin/${fileName}.zip`),
              path.join(remote.app.getPath('userData'), `./poc/${fileName}/${fileName}.zip`)) // 将uploadjson 转移到的poc/_id 文件下
            compressing.zip.uncompress(path.join(remote.app.getPath('userData'), `./poc/${fileName}/${fileName}.zip`),
              path.join(remote.app.getPath('userData'), `./poc/${fileName}`)) // 进行copy进行存放
            console.log(`云端下载本地的数据的解决====>>>>${fileName}`)
          }
        })
      }
    },
    download (data, id) { // 从云端下载到本地数据
      let parames = {
        target_list: JSON.stringify(data),
        download_id: id,
        data_type: 'plugin'
      }
      this.$post('client?act=client_download_data_handler', parames)
        .then(res => {
          if (res.errcode === '0') {
            let plugin_list = Base64.decode(this.$DataDecrypt(res.data.download_plugin_list))
            console.log(plugin_list)
            if (res.data.keys && res.data.keys === md5(res.data.download_plugin_list)) {
              console.log(plugin_list)
              let list = JSON.parse(plugin_list)
              console.log(list)
              list.forEach(item => {
                if (this.localIdArr.indexOf(item._id) === -1) {
                  this.$saveCloudPlugin(item)
                } else {
                  this.$updateCloudPlugin(item)
                }
              })
              this.downloadPlugin(data, id) // 下载需要更新的插件脚本
            } else if (res.data.download_plugin_count === 0) {
              this.finished = true
            } else {
              this.error = true
            }
            let _this = this
            this.timeout = setTimeout(function () {
              _this.selected = ''
            }, 10000)
          } else {
            this.error = true
          }
        })
        .catch(err => {
          this.error = true
          console.log(err)
        })
    }
  },
  components: {
    UploadJson,
    Login
  }
}
</script>

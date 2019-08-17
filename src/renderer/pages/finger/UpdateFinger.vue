<template>
	<div class="select_type update_finger">
		<div>
			<i class="iconfont icon-tongbu left"></i>
			<div class="right" v-if="selected==='' || selected === 'downloadDB' ">
				<p class="title">同步或管理指纹</p>
				<p class="content">同步指纹采用差量更新的方法，将本地指纹上传到云端或将云端指纹下载到本地</p>
				<p class="content">本地或云端名称相同的指纹，按指纹更新时间由新指纹替换旧指纹</p>
				<div class="mt20 mb30">
					<!-- <div style="margin-bottom: 20px">
						<el-radio v-model="radio" label="downloadDB">导出指纹</el-radio>
						<el-radio v-model="radio" label="uploadDB">导入指纹</el-radio>
					</div> -->
					<!-- <div> -->
						<el-radio v-model="radio" label="upload">上传到云端</el-radio>
						<el-radio v-model="radio" label="download">下载到本地</el-radio>
						<el-radio v-model="radio" label="handleCloud">管理云端指纹</el-radio>
					<!-- </div> -->
				</div>
				<p>
					<el-button :disabled="(!$store.state.isOnline) && (radio === 'upload' || radio === 'download' || radio === 'handleCloud')" class="btn" type="primary" @click="start">开 始</el-button>
				</p>
			</div>
			<div class="right" v-if="selected==='upload'">
				<p class="title">上传到云端</p>
				<p class="content">当前：本地指纹 {{localList?localList.length:0}} 个</p>
				<p class="content">当前：云端指纹 {{checkData.cloud_num}} 个</p>
				<div class="info">云端指纹新增 {{checkData.add_num}} 个，更新 {{checkData.update_num}} 个，忽略 {{checkData.ignore_num}} 个
				</div>
				<p class="info" v-if="!finished&&!error">正在同步......</p>
				<p class="info" v-if="finished">同步完成！</p>
				<p class="info red" v-if="error">同步失败，请重试！</p>
			</div>
			<div class="right" v-if="selected==='download'">
				<p class="title">下载到本地</p>
				<p class="content">当前：云端指纹 {{checkData.cloud_num}} 个</p>
				<p class="content">当前：本地指纹 {{localList?localList.length:0}} 个</p>
				<div class="info">本地指纹新增 {{checkData.add_num}} 个，更新 {{checkData.update_num}} 个，忽略 {{checkData.ignore_num}} 个
				</div>
				<p class="info" v-if="!finished&&!error">正在同步......</p>
				<p class="info" v-if="finished">同步完成！</p>
				<p class="info red" v-if="error">同步失败，请重试！</p>
			</div>
			<div class="right" v-if="selected==='uploadDB'">
				<p class="title">导入ZIP文件</p>
					<upload-json style="width: 180px" :PropsFilList="PropsFilList" ref="upload"
											 @SendFile="ReceiveFile">
					</upload-json>
			</div>
		</div>
	</div>
</template>

<script>
import md5 from 'blueimp-md5'
import { mapState } from 'vuex'
import UploadJson from '@/components/UploadJSON'
import { Base64 } from 'js-base64'

export default {
  data () {
    return {
      gridData: [], // 上传文件和本地有冲突
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
      timeout: null
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  watch: {
    radio (val) {
      console.log(val)
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
    start () {
      if (this.radio === 'handleCloud') {
        this.selected = 'handleCloud'
        this.$router.push('FingerCloud')
      } else if (this.radio === 'upload') {
        if (this.localList && this.localList.length > 0) {
          this.checkCloud('upload')
          this.selected = 'upload'
        } else {
          this.$message.error('本地没有新数据!')
        }
      } else if (this.radio === 'uploadDB') {
        this.selected = 'uploadDB'
      } else if (this.radio === 'downloadDB') {
        this.selected = 'downloadDB'
        this.handleDownload()
      } else {
        this.selected = 'download'
        this.checkCloud('download')
      }
    },
    /* 倒入和导出文件 start */
    readBlobAsDataURL (blob, callback) {
      var a = new FileReader()
      a.onload = function (e) { callback(e.target.result) }
      a.readAsDataURL(blob)
    },
    async handleDownload () {
      let _this = this
      let res = await this.$search({name: ''})
      if (res.data && res.data.length > 0) {
        console.log(JSON.stringify({'RECORDS': res.data}))
        let jsonData = JSON.stringify({'RECORDS': res.data})
        // console.log(_this.$EncryptFile(jsonData))
        let result = await this.str2ab(_this.$FileEncrypt(jsonData)) // 加密后的字符串进行的编码
        // let result = await this.str2ab(jsonData) // 加密后的字符串进行的编码
        console.log(result)
        this.downFile(result, 'finger.zip')
      } else {
        this.$message.error('本地列表为空!')
      }
    },
    ReceiveFile (val) {
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
        let resArr = JSON.parse(str).RECORDS
        console.log(resArr)
        _this.checkLoacl(resArr)
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
          this.$message({
            type: 'success',
            message: '导入成功!'
          })
        }
      }
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
            await this.$updateJson(this.gridData[i])
          }
        }).catch(() => {})
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
    /* 倒入导出 end */
    // 获取本地指纹列表
    getLocalList () {
      this.$search({name: ''})
        .then(res => {
          if (res.data.length > 0) {
            this.localData = res.data
            let _this = this
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
        use_for: type
      }
      this.$post('client?act=check_client_statistics_handler', parames)
        .then(res => {
          if (res.errcode === '0') {
            this.checkData = {
              cloud_num: res.data.yun_finger_count,
              add_num: res.data.new_finger_count,
              update_num: res.data.update_finger_count,
              ignore_num: res.data.ignore_finger_count
            }
            if (type === 'upload') {
              let updateList = []
              res.data.update_finger_list.forEach(item => {
                for (let val of this.localData) {
                  if (val._id === item) {
                    val.create_user = this.userInfo.user_id
                    updateList.push(val)
                    break
                  }
                }
              })
              this.upload(updateList, res.target_uuid)
            } else if (type === 'download') {
              this.download(res.data.update_finger_list, res.target_uuid)
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
    upload (data, id) {
      let parames = {
        finger_list: this.$DataEncrypt(JSON.stringify(data)),
        upload_id: id,
        keys: md5(JSON.stringify(data))
      }
      this.$post('client?act=client_upload_data_handler', parames)
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
    download (data, id) {
      let parames = {
        target_list: JSON.stringify(data),
        download_id: id,
        data_type: 'finger'
      }
      this.$post('client?act=client_download_data_handler', parames)
        .then(res => {
          if (res.errcode === '0') {
            let finger_list = Base64.decode(this.$DataDecrypt(res.data.download_finger_list))
            if (res.data.keys && res.data.keys === md5(res.data.download_finger_list)) {
              let list = JSON.parse(finger_list)
              list.forEach(item => {
                if (this.localIdArr.indexOf(item._id) === -1) {
                  this.$saveCloud(item)
                } else {
                  this.$updateCloud(item)
                }
              })
              this.finished = true
            } else if (res.data.download_finger_count === 0) {
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
    UploadJson
  }
}
</script>

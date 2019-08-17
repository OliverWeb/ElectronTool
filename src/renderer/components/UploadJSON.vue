<template>
  <div style="height:28px" class="upload-file-json">
    <el-upload
      drag
      class="upload-demo"
      ref="upload"
      action="/"
      :limit="2"
      :http-request="uploadFile"
      :auto-upload="false"
      :file-list="fileList"
      :on-preview="handleDown"
      :on-change="handleChange"
      :on-exceed="handleExceed"
    >
      <!--<el-button size="small" type="primary" plain>导入</el-button>-->
      <el-button :loading="!!loading" style="margin-left: 20px;" size="mini" class="export_btn">导入</el-button>
    </el-upload>
  </div>
</template>

<script>
export default {
  props: ['uploadLoading', 'PropsFilList', 'downParmas'],
  data () {
    return {
      loading: false,
      fileList: [],
      uploadError: false,
      pocFile: ''
    }
  },
  watch: {
    uploadLoading (val) {
      this.loading = !!val
      console.log('判断====>>>>>>>>>>>' + this.loading)
    },
    PropsFilList (val) {
      if (val) {
        this.fileList = [
          {name: val.slice(val.lastIndexOf('/') + 1), url: val}
        ]
      } else {
        this.fileList = []
      }
    },
    pocFile (val) {
      console.log(val)
      this.$emit('SendFile', val)
    }
  },
  methods: {
    submit () {
      this.$refs.upload.submit()
    },
    handleChange (file, fileList) {
      const isJPG = file.name.slice(file.name.lastIndexOf('.')) === '.zip'
      const isLt2M = file.size / 1024 / 1024 < 10
      // if (file.name.slice(file.name.lastIndexOf('.')) === '.py') {
      //   if (isJPG && file.name !== 'main.py') {
      //     this.$message.error('.py文件命名必须是main.py!')
      //     this.clearFiles()
      //   }
      // }
      if (!isJPG) {
        this.$message.error('上传文件只能是.zip格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传文件不能超过 10MB!')
      }
      if (!isJPG || !isLt2M) {
        this.$refs.upload.handleRemove(fileList[fileList.length - 1])
      }
      if (fileList.length > 1) {
        this.$refs.upload.handleRemove(fileList[0])
      }
      this.submit()
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择1个文件`)
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    uploadFile (data) {
      this.pocFile = data.file
    },
    // 下载文件
    handleDown (file) {
      if (this.fileList[0].name === file.name) {
        let params = {
          plugin_id: this.downParmas.plugin_id,
          vul_id: this.downParmas.vul_id
        }
        // 下载word
        this.$post('/plugin?act=download_poc_handler', params, {responseType: 'blob'}, params).then(res => {
          let blob = new Blob([res], {type: 'application/octet-stream'})
          this.downFile(blob, `${this.downParmas.plugin_id}.zip`)
        }).catch((error) => {
          this.$message.error(error)
        })
      }
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
    }
  }
}
</script>

<style lang="less">
  .upload-file-json{
    button{
      margin-left: 0 !important;
    }
    .export_btn {
      border: 1px solid #E1E3EE;
    
      &:hover {
        background: #f4f4f5
      }
    }
    .handle_btn {
      width: 100%;
      border: 0;
    }
    .upload-demo>div{
      width: 100%;
    }
    .el-upload-list{
      display: none;
    }
    .el-upload-dragger{
      width: 100%;
      height: 29px;
      border: 0;
      border-radius: 0;
    }
  }
</style>

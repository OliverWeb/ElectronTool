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
		</div>
		<el-row :gutter="30" class="local_finger">
			<el-col :span="15">
				<div class="grid-content">
					<p class="left_title">云端插件</p>
					<el-table :data="tableData" @row-click="selectActive" height="500">
            <el-table-column width="50">
							<template slot-scope="scope">
                <span
									class="circle"
									:class="{active:activeData._id===scope.row._id}"
									@click="activeData=scope.row"
								>
                  <i class="el-icon-check" v-if="activeData._id===scope.row._id"></i>
                </span>
							</template>
						</el-table-column>
						<el-table-column class-name="name" prop="name" show-overflow-tooltip>
						</el-table-column>
            <el-table-column width="150" class-name="left_type">
							<template slot-scope="scope">
								{{typeFun(scope.row)}}
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :span="9" v-if="tableData.length!==0">
				<div class="grid-content">
					<div class="right_bottom">
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
						<!-- <el-button class="six_btn" disabled>发布到六耳</el-button>
						<el-button class="six_btn" @click="handleEdit(activeData)">查看/编辑</el-button> -->
						<el-button class="six_btn" @click="removeData(activeData._id)">删 除</el-button>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>
<script>

export default {
  data () {
    return {
      plugin_type: require('../../../../static/json/plugin_type'),
      tableData: [],
      name: '',
      moreDir: false,
      show: false,
      edit: false,
      activeData: '',
      form: {url: ''},
      form_server: {
        ip: '',
        port: ''
      },
      rules: {
        ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
        port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
        url: [{ required: true, message: '请输入地址', trigger: 'blur' }]
      }
    }
  },
  watch: {
    name (val, old) {
      if (val !== old) {
        this.getTabelData()
      }
    }
  },
  mounted () {
    this.getTabelData()
  },
  methods: {
    pluginType (val) {
      console.log(val)
      if (val) {
        let selectedVal = this.plugin_type.filter(item => item.type === val)[0]
        console.log(selectedVal)
        return selectedVal.chinese
      }
    },
    showMoreDir (val) {
      if (val.length > 90 && !this.moreDir) {
        this.moreDir = true
      } else if (this.moreDir) {
        this.moreDir = false
      }
    },
    getTabelData () {
      this.$post('client?act=get_client_poc_list_handler', {search_param: this.name})
        .then(res => {
          if (res.errcode === '0') {
            this.tableData = res.data
            this.activeData = {...res.data[0]}
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
      this.activeData = row
    },
    removeData (_id) {
      this.$confirm('此操作将永久删除数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/client?act=del_client_poc_handler', {plugin_id: _id})
          .then(res => {
            if (this.name) {
              this.name = ''
            } else {
              this.getTabelData()
            }
          })
          .catch(err => {
            console.log(err)
          })
      }).catch(() => {
      })
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
    }
  },
  components: {}
}
</script>
<style>
</style>

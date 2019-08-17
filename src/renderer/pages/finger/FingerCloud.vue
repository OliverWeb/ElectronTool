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
		</div>
		<el-row :gutter="30" class="local_finger">
			<el-col :span="15">
				<div class="grid-content">
					<p class="left_title">云端指纹</p>
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
						<el-table-column min-width="300"  class-name="name" prop="name"></el-table-column>
						<el-table-column class-name="left_type">
							<template slot-scope="scope">{{scope.row.type==='web'?'Web指纹':'服务指纹'}}</template>
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
							label-width="80px"
							label-position="left"
							class="edit_form mb20"
						>
							<el-form-item label="指纹名称">{{activeData.name}}</el-form-item>
							<el-form-item label="指纹分类">{{activeData.dict_cn}}</el-form-item>
							<el-form-item label="厂商">{{activeData.manufacturer}}</el-form-item>
							<el-form-item label="识别名称">{{activeData.rec_name}}</el-form-item>
							<el-form-item label="指纹简介">
								<el-popover width="440" trigger="hover" :content="activeData.introduction">
									<span class="introduction" slot="reference">{{activeData.introduction}}</span>
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
      breadTitle: {
        url: ['资产指纹', '管理本地指纹'],
        title: '',
        path: '/index/finger'
      },
      tableData: [],
      name: '',
      show: false,
      edit: false,
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
    getTabelData () {
      this.$post('client?act=get_client_finger_list_handler', {search_param: this.name})
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
        this.$post('client?act=del_client_finger_handler', {finger_id: _id})
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
    }
  },
  components: {}
}
</script>
<style>
</style>

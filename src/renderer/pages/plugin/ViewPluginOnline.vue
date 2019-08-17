<template>
	<div class="sub_page">
		<div class="page_title">
			<el-input
				size="medium"
				type="text"
				style="width:340px;"
				placeholder="搜索插件"
				clearable
				v-model="name"
			></el-input>
      <el-select size="medium"  @change="getTabelData" v-model="plugin_type">
        <el-option
          key="全部类型"
          label="全部类型"
          value="">
        </el-option>
        <el-option
          v-for="item in vulType"
          :key="item.type"
          :label="item.chinese"
          :value="item.type">
        </el-option>
      </el-select>
		</div>
		<el-row :gutter="30" class="local_finger view_finger">
			<el-col :span="15">
				<div class="grid-content" ref="gridContent">
					<p class="left_title">插件库</p>
					<el-table :data="tableData" @row-click="selectActive" height="480">
            <el-table-column width="50">
							<template slot-scope="scope">
                <span
									class="circle"
									:class="{active:activeData._id===scope.row._id}"
									@click="activeData=scope.row"
								>
                  <i class="el-icon-check" v-if="activeData.fin_id===scope.row.fin_id"></i>
                </span>
              </template>
						</el-table-column>
						<el-table-column min-width="280"  class-name="name" prop="name" show-overflow-tooltip></el-table-column>
						<!-- <el-table-column min-width="300">
							<template slot-scope="scope">
                <span
									class="circle"
									:class="{active:activeData._id===scope.row._id}"
									@click="activeData=scope.row"
								>
                  <i class="el-icon-check" v-if="activeData.fin_id===scope.row.fin_id"></i>
                </span>
								<span class="name">{{scope.row.name}}</span>
							</template>
						</el-table-column> -->
						<el-table-column class-name="left_type" width="120" show-overflow-tooltip>
							<template slot-scope="scope">{{scope.row.vul_type_c}}</template>
						</el-table-column>
						<el-table-column class-name="left_type" width="80">
							<template slot-scope="scope">{{scope.row.level}}</template>
						</el-table-column>
					</el-table>
          <p @click="getMore" v-if="total>tableData.length" class="pointer grey align-c mb10" >加载更多...</p>
				</div>
			</el-col>
			<el-col :span="9" v-if="tableData.length!==0">
				<div class="grid-content">
					<div class="right_bottom">
						<p class="title">概览</p>
						<el-form
							size="mini"
							label-width="80px"
							label-position="left"
							class="edit_form mb20"
						>
							<el-form-item label="漏洞编号">{{activeData.vul_id}}</el-form-item>
							<el-form-item label="漏洞名称">{{activeData.name}}</el-form-item>
              <el-form-item label="危害等级">{{activeData.level}}</el-form-item>
							<el-form-item label="插件类型">{{activeData.vul_type_c}}</el-form-item>
							<el-form-item label="作 者">{{activeData.create_user}}</el-form-item>
							<el-form-item label="发布时间">{{$formatTime(activeData.audit_time).dateTime}}</el-form-item>
						</el-form>
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
      moreDir: false,
      tableData: [],
      total: null,
      page_num: 0,
      page_size: 10,
      vulType: [],
      plugin_type: '',
      name: '',
      activeData: '',
      options: []
    }
  },
  watch: {
    name (val, old) {
      if (val !== old) {
        this.tableData = []
        this.page_num = 0
        this.getTabelData()
      }
    }
  },
  mounted () {
    this.page_size = parseInt((this.$refs.gridContent.offsetHeight - 61) / 49)
    this.getTabelData()
    this.getPulginType()
  },
  methods: {
    getTabelData () {
      let params = {
        plugin_type: this.plugin_type,
        search_param: this.name,
        page_num: this.page_num,
        page_size: this.page_size
      }
      this.$post('client?act=search_all_plugin_handler', params)
        .then(res => {
          if (res.errcode === '0') {
            if (this.page_num === 0) {
              this.total = res.count
              this.tableData = res.data
              this.activeData = {...res.data[0]}
            } else {
              for (let val of res.data) {
                this.tableData.push(val)
              }
            }
          } else {
            this.tableData = []
            this.activeData = null
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    getPulginType () {
      this.$post('un_passport?act=get_plugin_type_dict_handler').then(res => {
        if (res.errcode === '0') {
          this.vulType = res.data
        } else {
          this.$message.error(res.errmsg)
        }
      }).catch(error => {
        console.log(error)
      })
    },
    selectActive (row) {
      this.activeData = row
    },
    getMore () {
      this.page_num++
      this.getTabelData()
    },
    // 查看更多简介
    showMoreDir (val) {
      if (val.length > 90 && !this.moreDir) {
        this.moreDir = true
      } else if (this.moreDir) {
        this.moreDir = false
      }
    }
  },
  components: {}
}
</script>


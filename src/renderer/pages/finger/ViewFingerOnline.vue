<template>
	<div class="sub_page">
		<div class="page_title">
			<el-input
				size="medium"
				type="text"
				style="width:340px;"
				placeholder="搜索指纹"
				clearable
				v-model="name"
			></el-input>
      <el-select v-model="filter.type" placeholder="指纹类型" size="medium" clearable class="ml10 mr10" >
        <el-option label="Web指纹" value="web"></el-option>
        <el-option label="服务指纹" value="service"></el-option>
      </el-select>
      <el-select v-model="filter.web_type" placeholder="指纹分类" size="medium" clearable v-if="filter.type!=='service'" >
        <el-option
          v-for="item in options"
          :key="item._id"
          :label="item.chinese"
          :value="item.slug">
        </el-option>
      </el-select>
      <el-select v-model="filter.service_type" placeholder="指纹分类" size="medium" clearable v-else>
        <el-option
          v-for="item in serverOps"
          :key="item._id"
          :label="item.chinese"
          :value="item.chinese">
        </el-option>
      </el-select>
		</div>
		<el-row :gutter="30" class="local_finger view_finger">
			<el-col :span="15">
				<div class="grid-content" ref="gridContent">
					<p class="left_title">指纹库</p>
					<el-table :data="tableData" @row-click="selectActive" height="480">
            <el-table-column width="50">
							<template slot-scope="scope">
                <span
									class="circle"
									:class="{active:activeData.fin_id===scope.row.fin_id}"
									@click="activeData=scope.row"
								>
                  <i class="el-icon-check" v-if="activeData.fin_id===scope.row.fin_id"></i>
                </span>
              </template>
						</el-table-column>
						<el-table-column min-width="280"  class-name="name" prop="name" show-overflow-tooltip></el-table-column>
						<el-table-column class-name="left_type">
							<template slot-scope="scope">{{scope.row.type}}</template>
						</el-table-column>
						<el-table-column class-name="left_type" show-overflow-tooltip>
							<template slot-scope="scope">{{scope.row.target_type}}</template>
							<!-- <template slot-scope="scope">{{scope.row.attribute[1]}}</template> -->
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
							<el-form-item label="指纹名称">{{activeData.name}}</el-form-item>
							<el-form-item label="指纹分类">{{activeData.attribute[1]}}</el-form-item>
							<el-form-item label="厂商">{{activeData.manufacturer}}</el-form-item>
							<el-form-item label="识别名称">{{activeData.rec_name}}</el-form-item>
							<el-form-item label="指纹简介">
								<el-popover width="440"  trigger="manual" v-model="moreDir" :content="activeData.introduction">
                  <span class="introduction" slot="reference" @click="showMoreDir(activeData.introduction)">{{activeData.introduction}}</span>
								</el-popover>
							</el-form-item>
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
      name: '',
      activeData: '',
      options: [],
      webOps: [],
      serverOps: [],
      filter: {
        type: '',
        web_type: '',
        service_type: ''
      }
    }
  },
  watch: {
    name (val, old) {
      if (val !== old) {
        this.tableData = []
        this.page_num = 0
        this.getTabelData()
      }
    },
    'filter.type': function (val) {
      if (val === 'web') {
        this.options = [...this.webOps]
        this.filter.service_type = ''
      } else {
        this.filter.service_type = ''
        this.filter.web_type = ''
        this.options = []
      }
    },
    filter: {
      handler: function (val, old) {
        this.tableData = []
        this.page_num = 0
        this.getTabelData()
      },
      deep: true
    }
  },
  mounted () {
    this.page_size = parseInt((this.$refs.gridContent.offsetHeight - 61) / 49)
    this.getTabelData()
    this.getWebFinger()
    this.getServerFinger()
  },
  methods: {
    getTabelData () {
      let params = {
        search_param: this.name,
        filter: JSON.stringify(this.filter),
        page_num: this.page_num,
        page_size: this.page_size
      }
      this.$post('un_passport?act=search_fin_handler', params)
        .then(res => {
          if (res.errcode === '0') {
            if (this.page_num === 0) {
              this.total = res.count
              this.tableData = res.data
              this.activeData = {...res.data[0]}
              console.log(this.tableData)
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
    getWebFinger () {
      this.$post('fingerprint?act=get_web_fin_dict_handler')
        .then(res => {
          if (res.errcode === '0') {
            this.webOps = res.data
          } else {
            this.webOps = []
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    getServerFinger () {
      this.$post('fingerprint?act=get_service_fin_dict_handler')
        .then(res => {
          if (res.errcode === '0') {
            this.serverOps = res.data
          } else {
            this.serverOps = []
          }
        })
        .catch(err => {
          console.log(err)
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


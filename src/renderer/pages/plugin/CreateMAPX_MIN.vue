<template>
    <div class="finger_web">
      <breadcrumb @backStep="backStep" @BreadCrumb="BreadCrumb" class="breadTitle"></breadcrumb>
        <div class="min_wrap">
          <div class="min_left">
            <el-collapse>
              <el-collapse-item name="1" title="基本信息">
                 <!-- <template slot="title">
                   <h3 class="swiper-title mt20">基本信息</h3>
                </template> -->
                <div>
                  <el-form :model="form" :rules="rules" ref="form" label-width="110px"
                          size="small">
                    <el-form-item v-if="$store.state.isOnline" label="漏洞名称：" prop="name">
                      <el-select
                        ref="name_select"
                        style="width: 100%;"
                        clearable
                        :remote-method="remoteMethod"
                        filterable
                        remote
                        v-model="form.name"
                        placeholder="请选择漏洞名称">
                        <el-option
                          v-for="(item,index) in vulName"
                          :key="index"
                          :label="`${item.name}${item.CVE?'('+ item.CVE+')': ''}`"
                          :value="JSON.stringify(item)">
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item v-else label="漏洞名称：" prop="name">
                      <el-input v-model="form.name" placeholder="请输入漏洞名称" :disabled="(!this.$store.state.isOnline) && (this.form.vul_id !== '')"></el-input>
                    </el-form-item>
                    <el-form-item label="类型：" prop="vul_type">
                      <el-select style="width: 100%;" filterable class="input_width" size="medium"
                                v-model="form.vul_type"
                                placeholder="请选择漏洞插件类型">
                        <el-option
                          style="width:200px"
                          v-for="item in vulType"
                          :key="item.type"
                          :label="item.chinese"
                          :value="item.type">
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="兼容性：" prop="compatibility">
                      <el-input :disabled="true" v-model="form.compatibility" size="medium"></el-input>
                    </el-form-item>
                    <el-form-item label="受影响实体：" prop="query">
                      <el-input
                        type="textarea"
                        rows="4"
                        placeholder='请输入受影响实体，例如：app="weblogic"'
                        v-model="form.query">
                      </el-input>
                    </el-form-item>
                    <el-form-item label="能否利用：" prop="use_flag">
                      <el-radio-group v-model="form.use_flag">
                        <el-radio label="check">检查</el-radio>
                        <el-radio label="check_use">检查+利用</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="备注：" prop="remark">
                      <el-input
                        type="textarea"
                        rows="4"
                        placeholder='请添加备注'
                        v-model="form.remark">
                      </el-input>
                    </el-form-item>
                  </el-form>
                  <!-- 漏洞信息结束 -->
                </div>
              </el-collapse-item>
            </el-collapse>
            <!-- <h3 class="swiper-title mt20">测试信息</h3> -->
            <!-- <p class="mt20 mb10">测试地址：</p> -->
            <el-input v-model="form.url" placeholder="请输入URL" size="mini" class="mb20 mt20"></el-input>
            <el-tree
                :data="data"
                node-key="id"
                @node-click="selected"
                highlight-current
                :default-checked-keys="[this.activeData.id]"
                default-expand-all
                :expand-on-click-node="false"
                draggable
                :allow-drop="allowDrop"
                :allow-drag="allowDrag"
                >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <span>{{ node.label }}</span>
                  <el-select v-model="data.relation" size="mini" class="min_select" v-if="data.relation">
                    <el-option label="与" value="AND"></el-option>
                    <el-option label="或" value="OR"></el-option>
                  </el-select>
                  <span>
                    <i :class="{'el-icon-success':data.pass==='通过',green:data.pass==='通过','el-icon-error':data.pass==='未通过','red':data.pass==='未通过'}" v-if="data.pass&&node.isLeaf" class="mr10"></i>
                      <el-button
                          type="text"
                          size="small"
                          @click="() => append(data)">
                          +
                      </el-button>
                      <el-button
                          :disabled="data.id===1"
                          type="text"
                          size="small"
                          @click="() => remove(node, data)">
                          -
                      </el-button>
                  </span>
                </span>
            </el-tree>
            <p class=" mb20 align-c" v-if="testRes" :class="{green:testRes==='存在漏洞', red:testRes==='无漏洞'}">{{testRes}}！</p>
             <el-button @click="testAll" type="primary" size="mini" style="width:100%;">测 试</el-button>
          </div>
          <div class="min_right">
            <mapx-min :prop="activeData.check" :vars="vars" @emit="saveRequest" @emitVars="getVars" :url="form.url" ref="mapx_min"></mapx-min>
          </div>
        </div>
        
    </div>
</template>

<script>
import md5 from 'blueimp-md5'
import Breadcrumb from '@/components/Breadcrumb'
import MapxMin from './MapxMin'
import { getStepData } from '@/assets/js/common.js'
// import md5 from 'blueimp-md5'
// let id = 1000
export default {
  data () {
    const data = [{
      id: 1,
      label: '组',
      relation: 'AND',
      disabled: true,
      children: [
        {
          id: 2,
          label: '请求测试1',
          pass: '',
          children: []
        }
      ]
    }]
    return {
      activeNames: '1',
      testRes: '',
      data: JSON.parse(JSON.stringify(data)),
      checks: {},
      activeData: {},
      form: {
        name: '',
        vul_id: '',
        vul_type: '',
        compatibility: 'MAPX',
        query: '',
        use_flag: 'check',
        remark: '',
        url: 'https://www.baidu.com',
        submit_type: '',
        index: 2,
        version: 1.1
      },
      initform: {
        name: '',
        vul_id: '',
        vul_type: '',
        compatibility: 'MAPX',
        query: '',
        use_flag: 'check',
        remark: '',
        url: 'https://www.baidu.com',
        submit_type: '',
        index: 2,
        version: 1.1
      },
      loading: false,
      vulName: [],
      oldName: [],
      vulType: [],
      plugin_type: require('../../../../static/json/plugin_type'),
      rules: {
        name: [
          {required: true, trigger: 'blur', message: '请输入漏洞名称'}, {
            validator: async (rule, value, callback) => {
              if (!value) {
                callback()
              } else if (value) {

              } else {
                callback(new Error('请填写漏洞名称!'))
              }
            }
          }],
        vul_type: [{required: true, message: '请选择插件类型', trigger: 'change'}],
        query: [{required: true, message: '请填写受影响实体', trigger: 'blur'}]
      },
      saveData: '',
      vars: {}
    }
  },
  watch: {
    '$store.state.isOnline': function (val) {
      if (val) {
        this.getVulName()
        this.form.submit_type = 'online'
      } else {
        this.form.submit_type = 'offline'
      }
    }
  },
  mounted () {
    this.getDetail()
    this.getPulginType()
    this.form.submit_type = this.$store.state.isOnline ? 'online' : 'offline'
    if (this.$store.state.isOnline) {
      this.getVulName()
    }
  },
  methods: {
    getDetail () {
      if (this.$route.query._id) {
        let _id = this.$route.query._id
        this.$searchPlugin({_id: _id}).then((res) => {
          this.form = {...res.data[0]}
          this.checks = res.data[0].checks
          this.data = res.data[0].testData
          this.vars = res.data[0].vars
          this.saveData = {...res.data[0]}
          this.activeData = {
            id: this.data[0].children[0].id,
            check: this.checks[this.data[0].children[0].id],
            version: this.form.version
          }
        })
      } else {
        this.activeData = {
          id: this.data[0].children[0].id,
          check: {},
          version: this.form.version
        }
        this.checks[this.activeData.id] = {}
      }
    },
    async selected (data, node) {
      if (node.isLeaf && (data.id !== this.activeData.id)) {
        // let if1 = JSON.stringify(this.checks[this.activeData.id]) !== JSON.stringify(this.$refs.mapx_min.form) // 判断右侧子组件信息与选中节点的信息是否一致
        // let if2 = data.label !== '组' // 判断是否点击的是组节点
        // if (if1 && if2) {
        //   await this.$refs.mapx_min.saveData()
        // }

        this.activeData.id = data.id
        this.activeData.check = this.checks[data.id]
      }
      // console.log(this.checks)
    },
    // 保存右侧测试信息
    saveRequest (data) {
      this.checks[this.activeData.id] = this.activeData.check = data
    },
    // 增加树结构
    append (data) {
      const newChild = { id: Math.floor(Math.random() * 100000 + 2), label: `请求测试${this.form.index++}`, children: [], pass: '' }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      if (!data.relation) {
        this.$set(data, 'label', '组')
        this.$set(data, 'relation', 'AND')
        this.checks[newChild.id] = JSON.parse(JSON.stringify(this.checks[data.id]))
        delete this.checks[data.id]
      } else {
        this.checks[newChild.id] = {}
      }
      data.children.push(newChild)
    },
    // 移除树结构
    remove (node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },
    backStep () {
      // this.$router.go(-1)
      if (this.form.submit_type === 'online') {
        let res = this.form.name
        this.form.name = this.JSONFun(res).name
        this.form.CVE = this.JSONFun(res).CVE ? this.JSONFun(res).CVE : ''
      }
      let newData = {...this.form, checks: this.checks, testData: this.data, signature: 'mapxj'}
      let initData = {...this.initform, checks: this.checks, testData: this.data, signature: 'mapxj'}
      if (md5(JSON.stringify(initData)) === md5(JSON.stringify(newData)) && !this.form._id) {
        this.$router.go(-1)
        return false
      } else if (md5(JSON.stringify(this.saveData)) === md5(JSON.stringify(newData))) {
        this.$router.go(-1)
        return false
      }
      // this.handleBack = true
      // /* 点击返回 */
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
    BreadCrumb (val) { // 操作函数类型
      if (val === 'save') {
        this.handleSave()
      }
    },
    // 保存插件
    async handleSave (cancel) {
      // if (JSON.stringify(this.checks[this.activeData.id]) !== JSON.stringify(this.$refs.mapx_min.form)) {
      //   await this.$refs.mapx_min.saveData()
      // }
      let flag = true
      this.$refs['form'].validateField('name', (valid) => {
        flag = !valid
      })
      if (flag) {
        if (this.JSONFun(this.form.name)) {
          let res = this.form.name
          this.form.name = this.JSONFun(res).name
          this.form.vul_id = this.JSONFun(res).vul_id
          this.form.CVE = this.JSONFun(res).CVE ? this.JSONFun(res).CVE : ''
        }

        // 构造setps数据
        let steps = {}
        await this.creatData(this.data[0])
          .then(res => {
            steps = res
          })
          .catch(err => {
            console.log(err)
          })
        let saveForm = {...this.form, checks: this.checks, steps: steps, testData: this.data, signature: 'mapxj', vars: this.vars}
        // console.log(saveForm)
        this.$savePlugin(saveForm)
          .then((res) => {
            // console.log(res)
            this.isSave = true // 保存成功,可以直接点击返回按钮
            this.form._id = res._id
            this.saveData = {...res} // 保存成功后进行赋值
            if (!cancel) {
              this.$message.success('已保存')
            }
          })
      } else {
        this.$message({
          message: '保存前，请先填写漏洞名称',
          type: 'warning'
        })
      }
    },
    // 构造提交六耳的数据
    async creatData (data) {
      var arr = []
      var obj = {}
      for (let item of data.children) {
        if (item.children && (item.children.length > 0)) { // 组
          await this.creatData(item)
            .then(res => {
              arr.push(res)
            })
        } else {
          arr.push(item.id)
        }
      }
      obj[data.relation] = arr
      return obj
    },
    testAll () {
      this.testRes = ''
      // this.$refs.mapx_min.saveData()
      if (Object.keys(this.checks[this.activeData.id]).length === 0) {
        this.$message.error('请先保存测试信息！')
      } else {
        getStepData(this.data[0], this.form.url, this.checks)
          .then(res => {
            this.testRes = res.res ? '存在漏洞' : '无漏洞'
            this.vars = res.vars
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    // async getQueryData (data) {
    //   var arr = []
    //   for (let item of data.children) {
    //     if (item.children && (item.children.length > 0)) { // 组
    //       await this.getQueryData(item)
    //         .then(res => {
    //           arr.push(res)
    //         })
    //         .catch(err => {
    //           console.log(err)
    //         })
    //     } else {
    //       await testOne(this.checks[item.id], this.form.url)
    //         .then(res => {
    //           arr.push(res)
    //           item.pass = res ? '通过' : '未通过'
    //         })
    //         .catch(err => {
    //           console.log(err)
    //         })
    //     }
    //   }
    //   let isPass
    //   if (data.relation === 'AND') {
    //     isPass = arr.toString().indexOf('false') < 0
    //   } else {
    //     isPass = arr.toString().indexOf('true') >= 0
    //   }
    //   return isPass
    // },
    getPulginType () {
      if (this.form.submit_type === 'online') {
        this.$post('/vulnerability?act=get_vul_p_type_dict_handler').then(res => {
          if (res.errcode === '0') {
            this.vulType = res.data
          } else {
            this.$message.error(res.message)
          }
        }).catch(error => {
          console.log(error)
        })
      } else {
        this.vulType = this.plugin_type
      }
    },
    remoteMethod (query) {
      if (query !== '') {
        this.loading = true
        this.getVulName(query)
        // console.log(this.vulName)
        // this.loading = false
      } else {
        this.vulName = this.oldName
      }
    },
    getVulName (query) {
      let params = {
        use_for: '',
        vul_name: query
      }
      this.$post('vulnerability?act=get_all_vul_name_handler', params)
        .then(res => {
          if (res.errcode === '0') {
            // console.log(res.data)
            this.oldName = {...res.data}
            this.vulName = res.data
          } else {
            this.$message.error(res.errmsg)
          }
        })
        .catch(err => {
          console.log(err)
        })
      this.loading = false
      // if (res.errcode === '0') {
      //   this.oldName = {...res.data}
      //   this.vulName = res.data
      //   resolve(res.data)
      // } else {
      //   this.$message.error(res.errmsg)
      // }
      // return new Promise(async resolve => {

      // })
    },
    JSONFun (str) {
      try {
        return JSON.parse(str)
      } catch (e) {
        return ''
      }
    },
    getVars (val) {
      this.vars = Object.assign({}, this.vars, val)
      console.log(this.vars)
    },
    // 树形控件可拖拽
    allowDrop (draggingNode, dropNode, type) {
      if (dropNode.isLeaf) {
        return type !== 'inner'
      } else if (dropNode.data.id !== 1) {
        return true
      } else {
        return type === 'inner'
      }
    },
    allowDrag (draggingNode) {
      return draggingNode.data.id !== 1
    }
  },
  components: {
    Breadcrumb,
    MapxMin
  }
}
</script>

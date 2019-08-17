<template>
    <div class="mapxmin_wrap" v-if="toggleShow">
        <div>
            <p class="title">请求信息</p>
            <el-form :model="form" label-width="120px" class="form" size="small">
                <el-form-item label="HTTP请求方法：">
                    <el-select v-model="form.request.method" placeholder="请选择">
                        <el-option
                        v-for="(item,i) in httpOpts"
                        :key="i"
                        :label="item"
                        :value="item">
                        </el-option>
                    </el-select>
                    <el-checkbox v-model="form.request.hop" class="ml10">支持跳转</el-checkbox>
                </el-form-item>
                <el-form-item label="测试URI：">
                    <el-input v-model="form.request.uri" placeholder="/install/"></el-input>
                </el-form-item>
                <el-form-item label="Headers：">
                    <el-input v-model="form.request.headers" type="textarea" :autosize="{ minRows: 4, maxRows: 10}" placeholder='{"key": "value"}'></el-input>
                </el-form-item>
                <el-form-item label="Post data：">
                    <el-input v-model="form.request.data" type="textarea" :autosize="{ minRows: 4, maxRows: 10}"></el-input>
                    <el-select v-model="form.request.datatype" class="datatype">
                      <el-option label="raw" value="raw"></el-option>
                      <el-option label="hexstring" value="hexstring"></el-option>
                      <el-option label="base64" value="base64"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div>
            <p class="title">回包信息</p>
            <vue-query-builder
                :rules="searchRules"
                :labels="labels"
                :style="false"
                v-model="form.response.query"
                >
                 <!-- @queryUpdated="queryUpdated"
                :initialQuery="initialQuery" -->
            </vue-query-builder>
        </div>
        <div>
            <p class="title">自定义变量</p>
            <div v-for="(item,i) in form.response.vars" :key="i" class="mb10">
              <span>变量{{i+1}}：</span>
              <el-input v-model="item.name" placeholder="name" style="width:160px" size="small" class="mr10"></el-input>
              <el-select v-model="item.from" placeholder="请选择" size="small" class="mr10" style="width:110px">
                <el-option label="Headers" value="headers"></el-option>
                <el-option label="Body" value="body"></el-option>
                <el-option label="StatusCode" value="StatusCode"></el-option>
              </el-select>
              <el-input v-model="item.value" placeholder="regex" style="width:200px" size="small" class="mr10" :disabled="item.from==='StatusCode'"></el-input>
              <el-button icon="el-icon-plus" size="mini" class="btn" @click="addVar"></el-button>
              <el-button icon="el-icon-minus" size="mini" class="btn" @click="minusVar(i)"></el-button>
            </div>
        </div>
        <div>
          <el-button type="primary" size="mini" @click="saveData">保 存</el-button>
          <el-button type="primary" size="mini" @click="test">测 试</el-button>
          <el-button size="mini" @click="showHeaders=true">查看HTTP头</el-button>
          <el-button size="mini" class="mr20" @click="$creatNewWin('HtmlCode')">查看HTTP正文</el-button>
         
          <span v-if="testRes" :class="{green:testRes==='通过', red:testRes==='未通过'}">{{testRes}}！</span>
        </div>
        <el-dialog
          title="HTTP头"
          :visible.sync="showHeaders"
          width="50%"
          >
          <p class="dialog_body" v-html="headersStr"></p>
        </el-dialog>
    </div>
</template>

<script>
import VueQueryBuilder from 'vue-query-builder'
import '@/assets/style/queryBuilder.less'
import { testOne, getVars } from '@/assets/js/common.js'
export default {
  props: ['prop', 'url', 'vars'],
  data () {
    return {
      toggleShow: true,
      showHeaders: false,
      testRes: '',
      // responseData: '',
      httpOpts: ['GET', 'POST', 'PUT', 'HEAD', 'PUSH', 'DELETE', 'OPTION'],
      labels: {
        matchType: '匹配类型',
        matchTypeAll: '与',
        matchTypeAny: '或',
        addRule: '添加规则',
        addGroup: '添加组',
        textInputPlaceholder: '请输入'
      },
      searchRules: [
        {
          type: 'text',
          id: 'code',
          label: 'HTTP响应码',
          operators: ['包含', '不包含', '正则表达式', '开头', '结尾', '等于', '不等于', '大于', '小于', '大于等于', '小于等于']
        },
        {
          type: 'text',
          id: 'headers',
          label: 'HTTP头',
          operators: ['包含', '不包含', '正则表达式', '开头', '结尾', '等于', '不等于', '大于', '小于', '大于等于', '小于等于']
        },
        {
          type: 'text',
          id: 'body',
          label: 'HTTP正文',
          operators: ['包含', '不包含', '正则表达式', '开头', '结尾', '等于', '不等于', '大于', '小于', '大于等于', '小于等于']
        }
      ],
      form: {
        request: {
          method: 'GET',
          uri: '',
          hop: true,
          headers: '',
          data: '',
          datatype: 'raw'
        },
        response: {
          query: {
            logicalOperator: '与',
            children: []
          },
          vars: [
            {
              'name': '',
              'from': 'headers',
              'value': '',
              'op': 'regex'
            }
          ]

        }
      },
      newData: {
        request: {
          method: 'GET',
          uri: '',
          hop: true,
          headers: '',
          data: '',
          datatype: 'raw'
        },
        response: {
          query: {
            logicalOperator: '与',
            children: [
              // {
              //   'type': 'query-builder-rule',
              //   'query': {
              //     'rule': 'code',
              //     'selectedOperand': 'HTTP响应码',
              //     'selectedOperator': '等于',
              //     'value': '200'
              //   }
              // }
            ]
          },
          vars: [
            {
              'name': '',
              'from': 'headers',
              'value': '',
              'op': 'regex'
            }
          ]
        }
      },
      varsData: {},
      headersStr: ''
    }
  },
  watch: {
    prop: {
      handler: function (val, old) {
        if (val !== old) {
          this.testRes = ''
          this.toggleShow = false
          let arr = this.prop ? Object.keys(this.prop) : []
          if (arr.length === 0) {
            this.form = JSON.parse(JSON.stringify(this.newData))
          } else {
            this.form = this.prop
            // 兼容第一版本————开始
            if (!this.form.response.vars || this.form.response.vars.length <= 0) {
              this.form.response.vars = [
                {
                  'name': '',
                  'from': 'headers',
                  'value': '',
                  'op': 'regex'
                }
              ]
            }
            if (this.form.request.header) {
              this.form.request.headers = this.form.request.header
            }
            if (this.form.response.query.children.length > 0 && (!val.version || val.version < 1.1)) {
              this.form.response.query = this.getQueryData(this.form.response.query)
            }
            // 兼容第一版本————结束
          }
          let _this = this
          this.$nextTick(() => {
            _this.toggleShow = true
          })
        }
      },
      deep: true
    }
  },
  methods: {
    async saveData () {
      await this.creatData(this.form.response.query)
        .then(res => {
          // console.log(res)
          this.form.response.matches = res
        })
        .catch(err => {
          console.log(err)
        })
      this.$emit('emit', this.form)
      // this.test()
    },
    // 构造提交六耳的数据
    async creatData (data) {
      var arr = []
      var obj = {}
      for (let item of data.children) {
        if (item.type === 'query-builder-rule') {
          let data = {
            'from': item.query.rule,
            'value': item.query.value,
            'op': this.chToEn(item.query.selectedOperator)
          }
          arr.push(data)
        } else {
          this.creatData(item.query)
            .then(res => {
              arr.push(res)
            })
        }
      }
      if (data.logicalOperator === '或') {
        obj['OR'] = arr
      } else {
        obj['AND'] = arr
      }
      return obj
    },
    // 中英文转换
    chToEn (text) {
      switch (text) {
        case '包含':
          return 'contain'
        case '不包含':
          return 'no_contain'
        case '正则表达式':
          return 'regex'
        case '开头':
          return 'begin'
        case '结尾':
          return 'end'
        case '等于':
          return 'equal'
        case '不等于':
          return 'no_equal'
        case '大于':
          return 'greater'
        case '小于':
          return 'less'
        case '大于等于':
          return 'greater_equal'
        case '小于等于':
          return 'less_equal'
      }
    },
    test () {
      this.testRes = ''
      if (!this.url) {
        this.$message.error('请填写请求地址！')
        return
      }
      testOne(this.form, this.url, this.vars)
        .then(res => {
          console.log(res)
          this.testRes = res.res ? '通过' : '未通过'
          // http正文
          this.$store.commit('updateHtmlCode', res.code.body)
          // http头
          this.headersStr = res.code.headersStr.replace(/\n/g, '<br/>')
          // 处理自定义变量

          let vars = getVars(res.code, this.form, this.vars)
          for (let i in this.form.response.vars) {
            if (this.form.response.vars[i].from === 'StatusCode') {
              this.form.response.vars[i].value = vars[this.form.response.vars[i].name]
            }
          }
          this.$emit('emitVars', vars)
          this.saveData()
        })
        .catch(err => {
          this.headersStr = ''
          this.$store.commit('updateHtmlCode', '')
          console.log(err)
        })
    },
    addVar () {
      let data = {
        'name': '',
        'from': 'headers',
        'value': '',
        'op': 'regex'
      }
      this.form.response.vars.push(data)
    },
    minusVar (i) {
      this.form.response.vars.splice(i, 1)
    },
    // 兼容旧版
    getQueryData (data) {
      var arr = []
      for (let item of data.children) {
        if (item.type === 'query-builder-rule') {
          if (item.query.rule === 'header') {
            item.query.rule = 'headers'
          }
          arr.push(item)
        } else {
          arr.push(this.getQueryData(item.query))
        }
      }
      return {
        logicalOperator: data.logicalOperator,
        children: arr
      }
    }
    // queryUpdated (query) {
    // //   this.$emit('emit', query)
    // }
  },
  components: {
    VueQueryBuilder
  }
}
</script>

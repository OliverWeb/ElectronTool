import Vue from 'vue'
// 引入部分elementui组件
import {
  Button,
  Input,
  Form,
  FormItem,
  Checkbox,
  Tabs,
  TabPane,
  Select,
  Option,
  Table,
  TableColumn,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Row,
  Col,
  Pagination,
  Message,
  MessageBox,
  Breadcrumb,
  BreadcrumbItem,
  Radio,
  RadioGroup,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Carousel,
  CarouselItem,
  Dialog,
  Switch,
  Popover,
  Icon,
  Progress,
  Upload,
  Tree,
  Collapse,
  CollapseItem
} from 'element-ui'
import nedb from './assets/js/nedb'
import nedbPlugin from './assets/js/nedb-plugin'
import axios from './assets/js/request/axios'
import router from './router'
import store from './store'
import App from './App'

import tcp from './assets/js/request/tcp'
import udp from './assets/js/request/udp'
import commonVue from './assets/js/commonVue'
import fingerVendor from './assets/js/finger_vendor'
// import fingerService from './assets/js/finger_service'
import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import './assets/style/index.less'
import './assets/iconfont/iconfont.css' // 引入字体库
import VueClipboard from 'vue-clipboard2' // 剪切板
import ace from 'ace-builds'
import componentsInstall from './components/install'
Vue.use(ace)
Vue.use(componentsInstall)
Vue.use(VueClipboard)
Vue.use(nedb)
Vue.use(nedbPlugin)
Vue.use(fingerVendor)
// Vue.use(fingerService)
Vue.use(commonVue)
Vue.use(tcp).use(udp)
Vue.use(axios)
Vue.use(Button)
  .use(Input)
  .use(Form)
  .use(FormItem)
  .use(Checkbox)
  .use(Tabs)
  .use(TabPane)
  .use(Select)
  .use(Option)
  .use(Table)
  .use(TableColumn)
  .use(Menu)
  .use(Submenu)
  .use(MenuItem)
  .use(MenuItemGroup)
  .use(Row)
  .use(Col)
  .use(Pagination)
  .use(Radio)
  .use(Breadcrumb)
  .use(BreadcrumbItem)
  .use(RadioGroup)
  .use(Dropdown)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(Carousel)
  .use(CarouselItem)
  .use(Dialog)
  .use(Switch)
  .use(Popover)
  .use(Icon)
  .use(Progress)
  .use(Upload)
  .use(Tree)
  .use(Collapse)
  .use(CollapseItem)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$alert = MessageBox.alert
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
require('electron').ipcRenderer.on('NamePath', (event, message) => {
  console.log(event)
  console.log(message)
})

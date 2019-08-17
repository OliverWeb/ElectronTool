import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/Index2'
// import Finger from '@/pages/Finger'
import FingerWeb from '@/pages/finger/FingerWeb'
import HtmlCode from '@/pages/finger/HtmlCode'
import FingerServer from '@/pages/finger/FingerServer'
import SelectFingerType from '@/pages/finger/SelectFingerType'
import FingerList from '@/pages/finger/FingerList'
import UpdateFinger from '@/pages/finger/UpdateFinger'
import FingerCloud from '@/pages/finger/FingerCloud'
import ViewFingerOnline from '@/pages/finger/ViewFingerOnline'
// 漏洞插件
import Plugin from '@/pages/Plugin'
import SelectPluginType from '@/pages/plugin/SelectPluginType'
import CreatePlugin from '@/pages/plugin/CreatePlugin'
import CreateMAPX_MIN from '@/pages/plugin/CreateMAPX_MIN'
import PluginList from '@/pages/plugin/PluginList'
import UpdatePlugin from '@/pages/plugin/UpdatePlugin'
import PluginCloud from '@/pages/plugin/PluginCloud'
import ViewPluginOnline from '@/pages/plugin/ViewPluginOnline'
import setting from '@/pages/setting/setting'
import switchAPI from '@/pages/switchAPI/switchAPI'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/index',
      component: Index,
      children: [
        {
          path: '',
          redirect: 'switchApi'
        },
        {
          path: 'switchApi',
          component: switchAPI
        },
        {
          path: 'FingerList',
          component: FingerList
        },
        {
          path: 'SelectFingerType',
          component: SelectFingerType
        },
        {
          path: 'FingerServer',
          name: 'FingerServer',
          component: FingerServer
        },
        {
          path: 'FingerWeb',
          name: 'FingerWeb',
          component: FingerWeb
        },
        {
          path: 'UpdateFinger',
          component: UpdateFinger
        },
        {
          path: 'FingerCloud',
          component: FingerCloud
        },
        {
          path: 'ViewFingerOnline',
          component: ViewFingerOnline
        },
        // 漏洞插件
        {
          path: 'Plugin',
          component: Plugin
        },
        {
          path: 'SelectPluginType',
          component: SelectPluginType
        },
        {
          path: 'CreatePlugin',
          name: 'CreatePlugin',
          component: CreatePlugin
        },
        {
          path: 'CreateMAPX_MIN',
          name: 'CreateMAPX_MIN',
          component: CreateMAPX_MIN
        },
        {
          path: 'UpdatePlugin',
          component: UpdatePlugin
        },
        {
          path: 'PluginList',
          component: PluginList
        },
        {
          path: 'PluginCloud',
          component: PluginCloud
        },
        {
          path: 'ViewPluginOnline',
          component: ViewPluginOnline
        },
        {
          path: 'setting',
          component: setting
        }
      ]
    },
    {
      path: '/HtmlCode',
      component: HtmlCode
    },
    // {
    //   path: '/',
    //   name: 'index',
    //   component: require('@/pages/index').default
    // },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

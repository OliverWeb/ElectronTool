<template>
    <div class="select_type">
        <div>
            <i class="iconfont icon-zhiwen1 left"></i>
            <div class="right">
                <p class="title">选择指纹类型</p>
                <p class="content">Web指纹是指Web类型应用系统中应用的开发语言、框架、脚本、插件、中间件、数据库等</p>
                <p class="content">服务指纹是指操作系统中的各种Service，或者是识别某种应用、某种设备的特定信息</p>
                <div class="mt20 mb30">
                    <el-radio v-model="radio" label="/index/FingerWeb">Web指纹</el-radio>
                    <el-radio v-model="radio" label="/index/FingerServer">服务指纹</el-radio>
                </div>
                <p> <el-button class="btn" type="primary" @click="$router.push(radio)">开 始</el-button></p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
  data () {
        return {
          radio: '/index/FingerWeb'
        }
  }
    }
</script>

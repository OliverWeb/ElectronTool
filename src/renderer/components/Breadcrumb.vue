<template>
	<div class="breadcrumb" style="background: #f7f8f9;">
		<!--<el-breadcrumb separator="/" style="margin-left: 32px">-->
		<!--<el-breadcrumb-item v-for="val in vtitle" :key="val.path" :to="{ path: val.path }">{{val.title}}</el-breadcrumb-item>-->
		<!--</el-breadcrumb>-->
		<div class="breadcrum_box">
			<div @click="backPre()">返回</div>
			<div @click="handleBtn('save')">保存</div>
			<!-- <div v-if="activeIndex !== 0" @click="handleBtn('pre')">上一页</div>
			<div v-if="activeIndex !== Number(length)" @click="handleBtn('next')">下一页</div> -->
		</div>
	</div>

</template>
<script>
export default {
  props: ['vtitle', 'activeIndex', 'length'],
  data () {
    return {
      to: '',
      from: ''
    }
  },
  watch: {
    activeIndex (val) {
      // console.log(val)
    }
  },
  mounted () {
  },
  methods: {
    backPre () {
      this.$emit('backStep')
    },
    handleBtn (type) {
      this.$emit('BreadCrumb', type)
    }
  }
}
</script>
<style lang="less">
	.breadcrumb {
		height: 44px!important;
		line-height: 44px!important;
		.breadcrum_box {
			margin-left: 30px;
			display: flex;
			cursor: pointer;
			
			& > div {
				font-weight: 400;
				/*color: ;*/
			}
			
			& > div:nth-child(2) {
				margin: 0 20px;
			}
		}
	}
</style>



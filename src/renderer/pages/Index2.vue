<template>
    <div class="index_wrap">
        <my-header></my-header>
        <transition name="fade" mode="out-in"><router-view/></transition>
    </div>
</template>

<script>
import myHeader from '../components/Header'
export default {
  data () {
    return {

    }
  },
  methods: {

  },
  components: {
    myHeader
  }
}
</script>

<style lang='less'>
    .hight100{
        height: 100%;
    }
</style>
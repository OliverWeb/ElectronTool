<template>
  <div style="height: 100%;position: relative">
    <div id="editor"></div>
  </div>
</template>

<script>
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver' // 在 webpack 环境中使用必须要导入
import 'ace-builds/src-noconflict/theme-monokai' // 默认设置的主题
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/snippets/html'
import 'ace-builds/src-noconflict/snippets/json'
// var
export default {
  props: {
    value: String,
    size: {
      default: () => {
        return [18, 10000]
      },
      type: Array
    }
  },
  data () {
    return {
      aceEditor: null,
      themePath: 'ace/theme/monokai', // 不导入 webpack-resolver，该模块路径会报错
      modePath: 'ace/mode/html' // 同上
      // modePath: 'ace/mode/json' // 同上
    }
  },
  watch: {
    value (val) {
      this.aceEditor.setValue(val) // 设置编辑器内容
    }
  },
  mounted () {
    this.aceEditor = ace.edit('editor', {
      // maxLines: this.size[1], // 最大行数，超过会自动出现滚动条
      // minLines: this.size[0], // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
      fontSize: 14, // 编辑器内字体大小
      //   theme: this.themePath, // 默认设置的主题
      mode: this.modePath, // 默认设置的语言模式
      tabSize: 4, // 制表符设置为 4 个空格大小
      value: this.value ? this.value : '',
      readOnly: true, // 只读模式
      wrap: 'free' // 自动换行
    })
  }
}
</script>
<style lang="less" scoped>
  #editor {
    margin: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>

<template>
  <div id="diff-output">
    <Editor :api-key="apiKey" id="editor3" :init="tinymceInit"></Editor>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import tinymceInit from '@/common/tinymceConfig/index'
export default {
  name: 'tinymceImage',
  components:{
    Editor
  },
  data() {
    return {
      apiKey: 'vibkstf9lypu0koiezkbclfxnxx0qg7ecz64kbhxr2ajlnl3',
      diffHtml: '',
      tinymceInit: {
        ...tinymceInit,
        height:'600'
      }
    }
  }
}
</script>

<style>
</style>
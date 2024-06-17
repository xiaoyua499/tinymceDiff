<template>
  <div>
    <div>
      <h3 >原始文本</h3>
      <Editor :api-key="apiKey" id="editor1" :init="tinymceInit"></Editor>
    </div>
    <div>
      <h3>修改后文本</h3>
      <Editor :api-key="apiKey" id="editor2" :init="tinymceInit"></Editor>
    </div>
    <button @click="showDiff">显示差异</button>
    <div id="diff-output">
      <Editor :api-key="apiKey" id="editor3" :init="tinymceInit"></Editor>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import HtmlDiff from '@/utils/htmlDiff'

export default {
  name: 'AboutView',
  components: {
    Editor,
  },
  data() {
    return {
      apiKey: 's0s46fxy77o6c7fonhqdrj07h3q06y2jmz2vmmivbdo7t6po',
      diffHtml: '',
      tinymceInit: {
        plugins: "table",
        toolbar: "table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
      },
    };
  },
  mounted() {
    setTimeout(() => {
      this.init();
    }, 1000);
  },
  methods: {
    init() {
      const htmldome = '<p>来来来来来带来</p><table style = "border-collapse: collapse; width: 100%; height: 44.7968px;" border = "1" ><tbody><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">哈哈哈哈</td><td style="width: 48.6688%; height: 22.3984px;">一一春春春春</td></tr><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">11111111</td><td style="width: 48.6688%; height: 22.3984px;">阿塞阀塞缝</td></tr></tbody></table>'
      tinymce.editors['editor1'].setContent(htmldome)
      tinymce.editors['editor2'].setContent(htmldome)
    },
    showDiff() {
      const editor1Content = tinymce.get('editor1').getContent()
      // console.log(editor1Content)
      const editor2Content = tinymce.get('editor2').getContent()
      // console.log(editor2Content)

      let html1 = editor1Content;
      let html2 = editor2Content;
      const htmlDiff = new HtmlDiff();
      const { time, diffHtml } = htmlDiff.diff_launch(html1, html2);
      // console.log(diffHtml);
      tinymce.editors['editor3'].setContent(diffHtml)
    }
  }
};
</script>

<style lang="scss" scoped>
</style>

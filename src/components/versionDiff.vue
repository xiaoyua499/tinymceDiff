<template>
  <div>
    <div>
      <h3>原始文本</h3>
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
import tinymceInit from '@/common/tinymceConfig/index'
export default {
  name: 'versionDiff',
  components: {
    Editor,
  },
  data() {
    return {
      apiKey: 'vibkstf9lypu0koiezkbclfxnxx0qg7ecz64kbhxr2ajlnl3',
      diffHtml: '',
      tinymceInit: tinymceInit
    };
  },
  mounted() {
    setTimeout(() => {
      this.init();
    }, 1000);
  },
  methods: {
    init() {

      // const htmldome1 = '<table style = "border-collapse: collapse; width: 100%; height: 44.7968px;" border = "1" ><tbody><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">asdf</td><td style="width: 48.6688%; height: 22.3984px;">啊海防</td></tr><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">零件<br/>海峰</td><td style="width: 48.6688%; height: 22.3984px;">哦出哦i儿童</td></tr></tbody></table>'
      // const htmldome2 = '<table style = "border-collapse: collapse; width: 100%; height: 44.7968px;" border = "1" ><tbody><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">asdf</td><td style="width: 48.6688%; height: 22.3984px;">啊海防</td></tr><tr style="height: 22.3984px;"><td style="width: 48.6688%; height: 22.3984px;">零件<br/>海峰</td><td style="width: 48.6688%; height: 22.3984px;">哦<span style="color: rgb(255, 0, 0);" id="123">出哦i儿</span>童</td></tr></tbody></table>'
      // const htmldome = '<p>来来<br/>来来来带来</p>'
      // const htmldome = '<p style="text-align: left;">凭证类型:业务受理单模板(对客户)</p><p style = "text-align: right;" > 前端流水号:</p><div style="display: flex;justify-content: space-between;align-items: center;"><p>交易日期:</p><p>交易日期:</p><p>交易日期:</p><p>交易日期:</p></div><p>-----------------客户/账户信息----------------</p><div style="display: flex;justify-content: space-between;align-items: center;"><p>交易日期:</p><p>交易日期:</p><p>交易日期:</p></div><div style="display: flex;justify-content: space-between;align-items: center;"><p>交易日期:</p><p>交易日期:</p><p>交易日期:</p></div><p>-----------------客户/账户信息----------------</p><p style="text-align: left;">第X笔:(交易名称)</p><div style="display: flex;justify-content: space-between;align-items: center;"><p>交易日期:</p><p>交易日期:</p><p>交易日期:</p></div>'
      const htmldome = '<ul><li>哈哈哈哈哈</li><li>kj看领导</li><li>看浪啊双开甲方阿塞</li></ul>'
      // const htmldome1='<p>来来<br/>来来来带来</p>'
      // const htmldome2='<p>来来<br/><span class="annotion"><span style="color: rgb(255, 0, 0);">来来来</span></span>带来</p>'
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
      const diffHtml = htmlDiff.diff_launch(html1, html2);
      console.log(diffHtml, '12312312');
      tinymce.editors['editor3'].setContent(diffHtml)
    },
    getContent() {
      const editor1Content = tinymce.get('editor1').getContent()
      console.log(editor1Content)
    }
  }
};
</script>

<style lang="scss">
/* 限制最大嵌套深度为3 */
ol,
ul {
  counter-reset: item;
}

ol,
ul > li {
  display: block;
  counter-increment: item;
  list-style-type: decimal;
}

ol,
ul > li:before {
  content: counters(item, ".") " ";
}
ol ol ol ol,
ul ul ul ul {
  list-style-type: none; /* 隐藏超过三级的列表 */
}
</style>

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
import logo from '@/assets/logo.png'

export default {
  name: 'AboutView',
  components: {
    Editor,
  },
  data() {
    return {
      apiKey: 'vibkstf9lypu0koiezkbclfxnxx0qg7ecz64kbhxr2ajlnl3',
      diffHtml: '',
      tinymceInit: {
        plugins: "table lists",
        toolbar: "table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol|bullist numlist",
        setup: function (editor) {
          editor.on('keydown', function (event) {
            if (event.key === 'Backspace') {
              const selectedNode = editor.selection.getNode(); // 获取当前选中的节点
              
              // 确认当前选中的节点是一个列表项
              if (selectedNode.nodeName === 'LI') {
                const range = editor.selection.getRng(); // 获取当前光标的范围
                const startOffset = range.startOffset; // 获取光标在节点中的起始位置
                // 判断光标是否在文本的开头
                if (startOffset === 0) {
                  event.preventDefault();
                  console.log(123);

                  editor.execCommand('Outdent');
                  // 阻止默认删除行为
                } else {
                  console.log('删除列表项中的文本内容');
                  // 在列表项中间或末尾，执行默认删除行为
                }
              }
            }
          });
          editor.on('NodeChange', (e) => {
               // 计算列表嵌套深度的函数
              function getListDepth(list) {
                let depth = 0;
                while (list && (list.tagName === 'OL' || list.tagName === 'UL')) {
                  list = list.parentElement.closest('ol, ul'); // 找到上一级的父列表
                  depth++;
                }
                return depth;
              }
              const list = e.element.closest('ol, ul'); // 找到最近的列表元素
              // console.log(list);
              
              if (list) {
                const depth = getListDepth(list);
                const maxDepth = 3; // 设定的最大嵌套深度

                // 如果嵌套深度超过设定值，取消进一步的嵌套
                if (depth > maxDepth) {
                  editor.execCommand('Outdent');
                }
              }
          });
        }
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

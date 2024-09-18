const tinymceInit = {
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
            // console.log(123);

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
}

export default tinymceInit